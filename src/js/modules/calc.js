export function calculator() {
    const btns = document.querySelectorAll('.btn_num');
    const display = document.querySelector('.calculator_display');
    const clear = document.querySelector('.btn_clear');
    const operatorBtn = document.querySelectorAll('.operator_btn');
    const equalBtn = document.querySelector('.equal_btn');
    const percentage = document.querySelector('.percentage');
    const plusMinus = document.querySelector('.plus_minus');

    let firstNum = [];
    let operatorArr = [];
    let secondNum = [];
    let result = [];

    // Events

    clear.addEventListener('click', clearAll);
    btns.forEach( btn => {
        btn.addEventListener('click', showNum);
    })
    operatorBtn.forEach( btn => {
        btn.addEventListener('click', reciveOperator);
    })
    equalBtn.addEventListener('click', calc);
    percentage.addEventListener('click', percentageCalc);
    plusMinus.addEventListener('click', changePlusMinus);

    // Delete all input values

    function clearAll() {
        display.classList.remove('small');
        display.innerText = '0';
        firstNum = [];
        operatorArr = [];
        secondNum = [];
        result = [];
    }

    // Change to negative volume or to positive

    function changePlusMinus() {
        if (operatorArr.length < 1) {
            if (firstNum.includes('-')) {
                return
            } else {
                if (firstNum.length === 0) {
                    return
                } else {
                    firstNum.unshift('-');
                    display.innerHTML = firstNum.slice('').join('');
                }
            }
        } else {
            if (secondNum.includes('-')) {
                return
            } else {
                secondNum.unshift('-');
                display.innerHTML = secondNum.slice('').join('');
            }
        }
    }
 
    // Calculate percentage

    function percentageCalc() {
        let result;
        if (operatorArr.length < 1) {
            result = (parseFloat(firstNum.slice('').join('')) / 100);
            firstNum = [];
            firstNum.push(result);
            display.innerHTML = result;
        } else {
            if (secondNum.length === 0) {
                result = (parseFloat((firstNum.slice('').join('')) / 100) * firstNum);
                secondNum = [];
                secondNum.push(result);
                display.innerHTML = result.toFixed(2);
            } else {
                result = (parseFloat((firstNum.slice('').join('')) / 100) * secondNum);
                secondNum = [];
                secondNum.push(result);
                display.innerHTML = result.toFixed(2);
            }
            
            
        }  
    }

    // Show on the display pressed number

    function showNum(e) {
        let buttonNum = e.target.innerText;

            // Recive and show first operand 

            if (operatorArr.length === 0) {
                if (firstNum.length < 1 && buttonNum === '.') {
                    firstNum.unshift('0');
                } else if (firstNum.includes('.') && buttonNum === '.') {
                    return
                } else if (result.toString().length !== 0 &&  buttonNum === '.') {
                    firstNum = [];
                    operatorArr = [];
                    secondNum = [];
                    result = [];
                }

                if (firstNum.length < 9) {
                    firstNum.push(buttonNum);
                }
    
                if (firstNum.length > 7) {
                    display.classList.add('small');
                }

                display.innerText = firstNum.slice('').join('');
    
            } else {

                // Recive and show second operand 

                if (secondNum.length === 0 && buttonNum === '.') {
                    secondNum.unshift('0');
                }

                if (secondNum.length < 9) {
                    secondNum.push(buttonNum);
                }
    
                if (secondNum.length > 7) {
                    display.classList.add('small');
                }

                display.innerText = secondNum.slice('').join('');
            }   
    }

    // Recive operator 

    function reciveOperator(e) {
        let operator = e.target.innerText;
        if (operatorArr.length === 0) {
            operatorArr.push(operator);
        }
        switch (operatorArr.length) {
            case(0):
                operatorArr.push(operator);
                break;
            case(1):
                operatorArr.splice(0, 1, operator);
        }
    }

    // Calculation

    function calc() {
        let firstOperand = parseFloat(firstNum.slice('').join(''));
        let secondOperand = parseFloat(secondNum.slice('').join(''));

        switch(operatorArr[0]) {
            case('+'):
                if (secondNum.length === 0) {
                    result = firstOperand + firstOperand;
                    clearAndShowResult();
                } else {
                    result = firstOperand + secondOperand;
                    clearAndShowResult();
                }
                break;
            case('-'):
                result = firstOperand - secondOperand;
                if (secondNum.length === 0) {
                    result = firstOperand - firstOperand;
                    clearAndShowResult();
                } else {
                    result = firstOperand - secondOperand;
                    clearAndShowResult();
                }
                break;
            case('x'):
                result = firstOperand * secondOperand;
                clearAndShowResult();
                break;
            case('/'):
                if (secondOperand == 0) {
                    display.innerText = 'Error';
                    firstNum = [];
                    secondNum = [];
                } else {
                    result = firstOperand / secondOperand;
                    clearAndShowResult();
                }
                break;
        }
    }

    function clearAndShowResult() {
        firstNum = [];
        secondNum = [];
        firstNum.push(result);

        if (result.toString().length > 9) {
            display.innerText = result.toExponential(2);
        } else if (result.toString().includes('.')) {
            display.innerText = result.toFixed(2);
        } else {
            display.innerText = result;
        }
    }
}