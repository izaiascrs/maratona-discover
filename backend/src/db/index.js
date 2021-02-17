import monk from 'monk';
const db = monk(process.env.MONGO_URI);
const transactions = db.get('transactions');

export default transactions;