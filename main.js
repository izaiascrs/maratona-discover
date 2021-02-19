window.addEventListener('load', () => {
    Api.getTransactions();
    const isSpeechSuport = 'webkitSpeechRecognition' in window;
    if(!isSpeechSuport) btnSpeak.btn.style.display = 'none';
})

const Modal = { 
    open() {
        document.querySelector('.modal-overlay')
        .classList.add('active')  
        Utils.setDefaultFormDate();
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
        Transaction.all.push(transaction);
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

    formatDateOnSpeak(date) {
        const arr = date.split('/');

        const day = arr[0].length == 1 ? "0" + arr[0] : arr[0];
        const month = arr[1].length == 1 ? "0" + arr[1]: arr[1];
        const year = arr[2];
    
        return `${year}-${month}-${day}`;
    },

    formatCurrency(value) {
        value= value / 100;

        value = value.toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL'
        });

        return value;
    },

    setDefaultFormDate() {
        let date = new Date();
        let today = `${ date.getFullYear() }-0${ date.getMonth() + 1 }-${ date.getDate() }`;
        document.getElementById("date").value = today
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

    async submit(event) {
        event.preventDefault();

        try {
            Form.validateFields();
            const transaction =  Form.formatValues();

            // formatar data para yy/mm/dd
            const date = transaction.date.split('/');
            const formatedDate = `${date[2]}/${date[1]}/${date[0]}`
            
            // chamada a API para adicionar transação no banco de dados 
            await Api.addTransaction({...transaction, date: formatedDate});
           
           // adicionar transação na DOM 
            Transaction.add(transaction);
            
            Form.clearFields();
            Modal.close();
            
        } catch (error) {
            alert(error.message);
            if(error.message.includes('adicionar transação')) Modal.close();
        }

    },    
}

const App = {
    init() {

        // Ordenar transações pelas mais recentes
        for (let index = Transaction.all.length; index > 0; index--) {
            DOM.addTransaction(Transaction.all[index-1], index-1);
        }
        
        DOM.updateBalance();
    },

    reload() {
        DOM.clearTransactions();
        App.init();
    },
}

const Api = {
    // 'http://localhost:3000/api/v1/transactions/'
    baseUrl: '',
    
    async getTransactions() {
        try {
            const data = await fetch(Api.baseUrl);
            const res = await data.json();

            // formatar data para dd/mm/yy
            res.forEach( el => el.date = Utils.formatDate(el.date));

            Transaction.all = res;
            App.init();
            
        } catch (error) {
           alert('Error ao carregar dados...');            
        }
    },

    async addTransaction(transaction) {
       try {
           await fetch(Api.baseUrl, { method: 'POST', headers:{ "Content-Type": "application/json" }, body: JSON.stringify(transaction) })
           
       } catch (error) {
         throw new Error('Não foi possível adicionar transação...');            
         }
    },

    async deleteTransaction(id) {
        await fetch(Api.baseUrl + id, { method: 'delete' });            
    },
}

const speakComands = {
    cancelar() {
        Form.amout.blur();
        Form.date.blur();
        Modal.close();        
    },

    encerrar(recognition) {
        recognition.stop();
    },
    
    salvar() {
        try {
            Form.validateFields();
            Form.submit(event);
            
        } catch (error) {
            alert(error.message)
            
        }
        Modal.close();        
    },

    adicionar() {
        Modal.open();
        Form.description.focus();
        return input.Focus = 'description';
    },

    
}

const input = {
    Focus: '',
}

const checkInputFocus = {

    description(transcript) {
        if(transcript == 'ok') {
            Form.amout.focus();
            return input.Focus = 'amout';
        }               
        Form.description.value = transcript;
    },

    amout(transcript) {
        if(transcript == 'ok') {
            Form.date.focus();
            return input.Focus = 'date';
        }
        Form.amout.value = transcript;
    },

    date(transcript) {
        if(transcript == 'ok' || transcript == 'salvar') {
            Form.date.blur();
            return input.Focus = '';
        }
        transcript = Utils.formatDateOnSpeak(transcript);
        Form.date.value = transcript;
    }

}

const btnSpeak = {
    btn: document.getElementById('btn-speak'), 

    addClass() {
        btnSpeak.btn.classList.add('speaking');
        btnSpeak.btn.style.background = 'var(--green)';
    },

    removeClass() {
        console.log('remove class');
        btnSpeak.btn.classList.remove('speaking');
        btnSpeak.btn.style.background = 'var(--dark-blue)';
    },

    speaking(recognition) {
        recognition.stop();
        btnSpeak.btn.classList.remove('speaking')
        return btnSpeak.btn.style.background = 'var(--dark-blue)';     
    }
}

const Speak = {
        
    start() {
        const SpeechRecognition =  window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.start();
        const btnClass = btnSpeak.btn.classList[0];
        
        if(btnClass == 'speaking') {
            btnSpeak[btnClass](recognition);
        } else {
            btnSpeak.addClass();
        }

        recognition.onresult = (event) => {        
            const current = event.resultIndex;            
            let transcript = (event.results[current][0].transcript).toLocaleLowerCase().trim();
            
            const speakOptions =  speakComands[transcript];
            const focus = checkInputFocus[input.Focus];

            // checar se o comando é valido e igual encerrar
            // retornar função com o parâmetro recognition 
            if(speakOptions && transcript == 'encerrar') {
                btnSpeak.removeClass();
                return speakOptions(recognition);
            }

            // checar se o comando é valido
            if(speakOptions) return speakOptions();

            // checar qual input está em foco
            if(focus) return  focus(transcript);           
                        
        }

    }

}
