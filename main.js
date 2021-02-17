window.addEventListener('load', () => {
    Api.getTransactions();    
})

const setDefaultFormDate = () => {
    let date = new Date();
    let today = `${ date.getFullYear() }-0${ date.getMonth() + 1 }-${ date.getDate() }`;
    document.getElementById("date").value = today
}

const Modal = { 
    open() {
        document.querySelector('.modal-overlay')
        .classList.add('active')  
        setDefaultFormDate();     
    },
    
    close() {
        document.querySelector('.modal-overlay')
        .classList.remove('active')
        Form.clearFields();
    }
}

const Transaction = {
    all: [],

    add(transaction) {
        Transaction.all.unshift(transaction);
        App.reload();
    },

    remove(index) {
         const transactionID  = Transaction.all[index]._id;
        Api.deleteTransaction(transactionID);
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
        value = value * 100;
        return Math.round(value);
    },

    formatDate(date) {
        const splittedDate = date.split('-');
        return `${splittedDate[2].slice(0,2)}/${splittedDate[1]}/${splittedDate[0]}`;
    },

    formatCurrency(value) {
        value= value / 100;

        value = value.toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL'
        });

        return value;
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

            // formatar data para yy/mm/dd
            const date = transaction.date.split('/');
            const formatedDate = `${date[2]}/${date[1]}/${date[0]}`
            
            // chamada a API para adicionar transação no banco de dados 
            Api.addTransaction({...transaction, date: formatedDate});
            
            // adicionar transação na DOM 
            Transaction.add(transaction);
            
            Form.clearFields();
            Modal.close();
            App.reload()
            
        } catch (error) {
            alert(error.message)
        }

    },    
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction);
        DOM.updateBalance();
    },

    reload() {
        DOM.clearTransactions();
        App.init();
    },
}

const Api = {
    baseUrl: 'http://localhost:3000/api/v1/transactions/',
    
    async getTransactions() {
        const data = await fetch(Api.baseUrl);
        const res = await data.json();

        // formatar data para dd/mm/yy
        res.forEach( el => el.date = Utils.formatDate(el.date));

        Transaction.all = res;
        App.init();
    },

    async addTransaction(transaction) {
        await fetch(Api.baseUrl, { method: 'POST', headers:{ "Content-Type": "application/json" }, body: JSON.stringify(transaction) })
    },

    async deleteTransaction(id) {
        await fetch(Api.baseUrl + id, { method: 'delete' });            
    },
}
