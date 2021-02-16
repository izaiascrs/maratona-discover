
const Modal = { 
    toggle() {
        document.querySelector('.modal-overlay')
        .classList.toggle('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('transaction')) || [];
    },

    set(transaction) {
        localStorage.setItem('transaction', JSON.stringify(transaction))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction);
        App.reload();
    },

    remove(index) {
        console.log(Transaction.all);
        Transaction.all.splice(index, 1);

        App.reload();
    },

    incomes() {
        let income = 0;
        Transaction.all.forEach((transaction) => {
            transaction.amout > 0 ? income += transaction.amout : 0; 
        })       
        
        return income;
    },

    expenses() {
        let expense = 0;
        Transaction.all.forEach((transaction) => {
            transaction.amout < 0 ? expense += transaction.amout : 0; 
        })

        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses(); 
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;
        DOM.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amout > 0 ? 'income': 'expense';
        
        const amout = Utils.formatCurrency(transaction.amout);

        const html = `
            <td class="description">${transaction.description}</td>
            <td class=${CSSclass}>${amout}</td>
            <td class="date">${transaction.date}</td>
            <td><img onclick="Transaction.remove(${index})" src="assets/minus.svg" alt="remover Transação"></td>
        `;
        return html;
    },

    updateBalance() {
        document.getElementById('income-display')
        .innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expense-display')
        .innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('total-display')
        .innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = '';
    }
}

const Utils = {
    formatAmout(value) {
        value = Number(value) * 100;
        return value;
    },

    formatDate(date) {
        const splittedDate = date.split('-');       
        
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;

    },

    formatCurrency(value) {
        const sign = Number(value) < 0 ? '-' : '';

        value = String(value).replace(/\D/g, "");

        value= Number(value) / 100;

        value = value.toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL'
        });

        return sign + value;
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amout: document.querySelector('input#amout'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amout: Form.amout.value,
            date: Form.date.value,
        }
    },
    
    validateFields() {        
        const obj = Form.getValues();

        for (const el in obj) {
           if(obj[el].trim() === '') {
               throw new Error('Por favor, preencha todos os campos!');
           }            
        }        
    },
    
    formatValues() {
        let { description, amout, date } = Form.getValues();
        
        amout = Utils.formatAmout(amout);

        date = Utils.formatDate(date);

        return { description, amout, date };

    },

    clearFields(){
        Form.description.value = '';
        Form.amout.value = '';
        Form.date.value = '';
    },

    submit(event) {
        event.preventDefault();

        try {
            Form.validateFields();
            const transaction =  Form.formatValues();

            Transaction.add(transaction);

            Form.clearFields();

            Modal.toggle();
            
        } catch (error) {
            alert(error.message)
        }

    },    
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction);

        DOM.updateBalance();

        Storage.set(Transaction.all);
    },

    reload() {
        DOM.clearTransactions();
        App.init();
    },
}

App.init();
