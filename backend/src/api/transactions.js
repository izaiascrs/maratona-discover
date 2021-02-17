import express from 'express';
import Transactions from '../db/index.js';
import Schema from '../models/index.js';

const router = express.Router();

router.get('/', async(req, res, next) => {
    try {
        const items = await Transactions.find();
        res.json(items)

    } catch (error) {
        next(error)
    }  
});

router.post('/', async (req, res, next) => {
  try {
      const value = await Schema.validateAsync(req.body);
      const inserted = await Transactions.insert(value) 
      res.json(inserted)            
  } catch (error) {
      next(error)      
  }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Transactions.remove(id);
        res.json({ ok: true })
    } catch (error) {
        next(error)
    }
});

export default router;
