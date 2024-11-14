const teleramToken_rentu_bot = '7709475459:AAEjnF0u8ZPXR2PPuVc6b5_RYhAm4zn8O6c';
const telegramUrl = 'https://api.telegram.org/bot' + teleramToken_rentu_bot;

let textMesage = 'My first message from bot)))'

const sendMessageTelegram = async (message = textMesage) => {
   const url = telegramUrl + '/sendMessage?chat_id=-4592485603&text=' + message;

   const res = await fetch(url);

   console.log(res);

   if (!res.ok) {
      const error = await res.json();
   }
};


module.exports = {
   sendMessageTelegram
}