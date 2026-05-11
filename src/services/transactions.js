import { addDoc, collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';

function normalizeDateTime(rawDateValue) {
  const parsed = new Date(rawDateValue);
  if (Number.isNaN(parsed.getTime())) {
    const fallback = new Date();
    return {
      date: fallback.toISOString().slice(0, 10),
      time: fallback.toTimeString().slice(0, 5),
    };
  }

  return {
    date: parsed.toISOString().slice(0, 10),
    time: parsed.toTimeString().slice(0, 5),
  };
}

function mapDocToUiTransaction(data) {
  const isoDate = `${data.date || '1970-01-01'}T${data.time || '00:00'}:00`;
  const parsed = new Date(isoDate);
  const fallbackDate = data.date || '1970-01-01';

  return {
    name: data.description || 'Transaction',
    date: Number.isNaN(parsed.getTime())
      ? fallbackDate
      : parsed.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    rawDate: Number.isNaN(parsed.getTime()) ? fallbackDate : parsed.toISOString(),
    amount: Number(data.amount) || 0,
    category: data.category || 'other',
    description: data.description || '',
  };
}

function getUserTransactionsCollection(uid) {
  return collection(db, 'users', uid, 'transactions');
}

export async function saveUserTransaction(uid, transactionInput) {
  if (!uid) {
    return {
      success: false,
      data: null,
      error: 'User ID is required to save transactions',
    };
  }

  try {
    const { date, time } = normalizeDateTime(transactionInput.rawDate || transactionInput.date);
    const normalizedAmount = Number(transactionInput.amount) || 0;
    const payload = {
      date,
      time,
      amount: normalizedAmount,
      description: transactionInput.description || transactionInput.name || '',
      category: transactionInput.category || 'other',
    };

    await addDoc(getUserTransactionsCollection(uid), payload);
    return {
      success: true,
      data: mapDocToUiTransaction(payload),
      error: null,
    };
  } catch (error) {
    console.error('saveUserTransaction failed:', error);
    return {
      success: false,
      data: null,
      error: 'Could not save transaction. Please try again.',
    };
  }
}

export async function getUserTransactions(uid) {
  if (!uid) return [];

  const snapshot = await getDocs(query(getUserTransactionsCollection(uid)));
  return snapshot.docs
    .map((docSnapshot) => mapDocToUiTransaction(docSnapshot.data()))
    .sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
}
