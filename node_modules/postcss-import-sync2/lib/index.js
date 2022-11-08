'use strict'
// builtin tooling
const path = require('path')

// external tooling
const postcss = require('postcss')

// internal tooling
const joinMedia = require('./join-media')
const resolveId = require('./resolve-id')
const loadContent = require('./load-content')
const processContent = require('./process-content')
const parseStatements = require('./parse-statements')

function AtImport(options) {
    options = Object.assign(
        {
            root: process.cwd(),
            path: [],
            skipDuplicates: true,
            resolve: resolveId,
            load: loadContent,
            plugins: [],
            addModulesDirectories: [],
        },
        options
    )

    options.root = path.resolve(options.root)

    // convert string to an array of a single element
    if (typeof options.path === 'string') options.path = [options.path]

    if (!Array.isArray(options.path)) options.path = []

    options.path = options.path.map((p) => path.resolve(options.root, p))

    return function (styles, { result }) {
        const state = {
            importedFiles: {},
            hashFiles: {},
        }

        if (styles.source && styles.source.input && styles.source.input.file) {
            state.importedFiles[styles.source.input.file] = {}
        }

        if (options.plugins && !Array.isArray(options.plugins)) {
            throw new Error('plugins option must be an array')
        }

        const bundle = parseStyles(result, styles, options, state, [])
        applyRaws(bundle)
        applyMedia(bundle)
        applyStyles(bundle, styles)
    }
}

function applyRaws(bundle) {
    bundle.forEach((stmt, index) => {
        if (index === 0) return

        if (stmt.parent) {
            const before = stmt.parent.node.raws.before
            if (stmt.type === 'nodes') stmt.nodes[0].raws.before = before
            else stmt.node.raws.before = before
        } else if (stmt.type === 'nodes') {
            stmt.nodes[0].raws.before = stmt.nodes[0].raws.before || '\n'
        }
    })
}

function applyMedia(bundle) {
    bundle.forEach((stmt) => {
        if (!stmt.media.length) return
        if (stmt.type === 'import') {
            stmt.node.params = `${stmt.fullUri} ${stmt.media.join(', ')}`
        } else if (stmt.type === 'media') stmt.node.params = stmt.media.join(', ')
        else {
            const nodes = stmt.nodes
            const parent = nodes[0].parent
            const mediaNode = postcss.atRule({
                name: 'media',
                params: stmt.media.join(', '),
                source: parent.source,
            })

            parent.insertBefore(nodes[0], mediaNode)

            // remove nodes
            nodes.forEach((node) => {
                node.parent = undefined
            })

            // better output
            nodes[0].raws.before = nodes[0].raws.before || '\n'

            // wrap new rules with media query
            mediaNode.append(nodes)

            stmt.type = 'media'
            stmt.node = mediaNode
            delete stmt.nodes
        }
    })
}

function applyStyles(bundle, styles) {
    styles.nodes = []

    bundle.forEach((stmt) => {
        if (stmt.type === 'import') {
            stmt.node.parent = undefined
            styles.append(stmt.node)
        } else if (stmt.type === 'media') {
            stmt.node.parent = undefined
            styles.append(stmt.node)
        } else if (stmt.type === 'nodes') {
            stmt.nodes.forEach((node) => {
                node.parent = undefined
                styles.append(node)
            })
        }
    })
}

function parseStyles(result, styles, options, state, media) {
    const statements = parseStatements(result, styles)

    function bundleStatement(statements) {
        const imports = []
        const bundle = []

        // squash statements and their children
        statements.forEach((stmt) => {
            if (stmt.type === 'import') {
                if (stmt.children) {
                    stmt.children.forEach((child, index) => {
                        if (child.type === 'import') imports.push(child)
                        else bundle.push(child)
                        // For better output
                        if (index === 0) child.parent = stmt
                    })
                } else imports.push(stmt)
            } else if (stmt.type === 'media' || stmt.type === 'nodes') {
                bundle.push(stmt)
            }
        })

        return imports.concat(bundle)
    }

    statements.forEach((stmt) => {
        stmt.media = joinMedia(media, stmt.media || [])
        // skip protocol base uri (protocol://url) or protocol-relative
        if (stmt.type !== 'import' || /^(?:[a-z]+:)?\/\//i.test(stmt.uri)) {
            return
        }

        return resolveImportId(result, stmt, options, state)
    })

    return bundleStatement(statements)
}

function resolveImportId(result, stmt, options, state) {
    const atRule = stmt.node
    let sourceFile
    if (atRule.source && atRule.source.input && atRule.source.input.file) {
        sourceFile = atRule.source.input.file
    }
    const base = sourceFile ? path.dirname(atRule.source.input.file) : options.root

    const paths = options.resolve(stmt.uri, base, options)

    try {
        stmt.children = (!Array.isArray(paths) ? [paths] : paths).reduce((all, file) => {
            const filePath = !path.isAbsolute(file) ? resolveId(file, base, options) : file
            // Add dependency messages
            result.messages.push({
                type: 'dependency',
                file: filePath,
                parent: sourceFile,
            })
            const statements = loadImportContent(result, stmt, filePath, options, state)
            return statements ? all.concat(statements) : all
        }, [])
    } catch (err) {
        if (err.message.indexOf('Failed to find') !== -1) {
            throw err
        }
        result.warn(err.message, { node: atRule })
    }
}

function loadImportContent(result, stmt, filename, options, state) {
    const atRule = stmt.node
    const media = stmt.media
    if (options.skipDuplicates) {
        // skip files already imported at the same scope
        if (state.importedFiles[filename] && state.importedFiles[filename][media]) {
            return
        }

        // save imported files to skip them next time
        if (!state.importedFiles[filename]) state.importedFiles[filename] = {}
        state.importedFiles[filename][media] = true
    }

    const fileContent = options.load(filename, options)

    function handleLazyResult(lazyResult, content) {
        const styles = lazyResult.root
        result.messages = result.messages.concat(lazyResult.messages)

        if (options.skipDuplicates) {
            const hasImport = styles.some((child) => {
                return child.type === 'atrule' && child.name === 'import'
            })
            if (!hasImport) {
                // save hash files to skip them next time
                if (!state.hashFiles[content]) state.hashFiles[content] = {}
                state.hashFiles[content][media] = true
            }
        }
        // recursion: import @import from imported file
        return parseStyles(result, styles, options, state, media)
    }

    function onResolve(content) {
        if (content.trim() === '') {
            result.warn(`${filename} is empty`, { node: atRule })
            return
        }

        // skip previous imported files not containing @import rules
        if (state.hashFiles[content] && state.hashFiles[content][media]) return

        const lazyResult = processContent(result, content, filename, options)

        return handleLazyResult(lazyResult, content)
    }

    return onResolve(fileContent)
}

module.exports = AtImport
