// Publish only verified content approved for public use. Empty entries stay hidden.
export const ownersTrust = {
  founded: 2018,
  specialization: 'Продаж квартир у Львові: від аналізу ринку та підготовки презентації до переговорів із покупцями.',
  // Fill all four fields and set verified: true after approval.
  expert: { verified: false, name: '', role: '', bio: '', photo: '' },
  // Use a real completed sale, with the owner's permission. No exact address needed.
  saleCase: { verified: false, title: '', context: '', approach: '', result: '' },
};
