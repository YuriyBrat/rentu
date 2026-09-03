import { buildPropertyFormData } from './propertyFormData';

export async function createProperty(payload) {
   const fd = buildPropertyFormData(payload);

   const res = await fetch('/api/crm/properties', {
      method: 'POST',
      body: fd,
   });

   if (!res.ok) {
      const text = await res.text();
      const error = new Error(text || 'Помилка створення обʼєкта');
      error.status = res.status;
      throw error;
   }

   return res.json();
}

export async function updateProperty(id, payload) {
   const fd = buildPropertyFormData(payload);

   const res = await fetch(`/api/crm/properties/${id}`, {
      method: 'PATCH',
      body: fd,
   });

   if (!res.ok) {
      const text = await res.text();
      const error = new Error(text || 'Помилка оновлення обʼєкта');
      error.status = res.status;
      throw error;
   }

   return res.json();
}
