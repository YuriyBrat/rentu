export const OPERATION_SCORING_RULES = {
   showing: 1,
   initiativeShowing: 2,
   showingNewClientBonus: 1,
   showingNewObjectBonus: 1,
   review: 1,
   reviewNewObject: 2,
   pzs: 4,
   deposit: 8,
   pers: 10,
};

export const OPERATION_SCORING_LABELS = {
   showing: 'Показ',
   initiativeShowing: 'Ініціативний показ',
   showingNewClientBonus: 'Результат показу: новий клієнт',
   showingNewObjectBonus: 'Результат показу: новий об’єкт',
   review: 'Огляд',
   reviewNewObject: 'Огляд із новим об’єктом',
   pzs: 'ПЗС',
   deposit: 'ЗС',
   pers: 'ПЕРС',
};

export const OPERATION_SCORING_DESCRIPTIONS = {
   showing: 'звичайний показ',
   initiativeShowing: 'рієлтор сам ініціював і витягнув клієнта на показ',
   showingNewClientBonus: 'додатковий бал, якщо показ дав нового клієнта',
   showingNewObjectBonus: 'додатковий бал, якщо показ дав новий об’єкт',
   review: 'огляд об’єкта',
   reviewNewObject: 'огляд завершився новим об’єктом у роботі',
   pzs: 'зафіксована передзавдаткова стадія',
   deposit: 'оформлений завдаток',
   pers: 'переоформлення / фінальне виконання',
};
