export default function CRMNotFound() {
   return (
      <div style={{ padding: 24 }}>
         <h2 style={{ margin: 0 }}>CRM: сторінку не знайдено</h2>
         <p style={{ opacity: 0.75, marginTop: 8 }}>
            Такого розділу немає. Перевір URL або відкрий потрібний пункт меню.
         </p>
         <p style={{ opacity: 0.6, marginTop: 16 }}>
            Порада: перейди в “Об’єкти” або “Клієнти”.
         </p>
      </div>
   );
}