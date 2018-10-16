import * as SparkPost from 'sparkpost';
const client = new SparkPost(process.env.SPARKPOST_API_KEY);

export const sendEmail = async (recipient: string, url: string) => {
  const response = client.transmissions.send({
    content: {
      from: 'testing@sparkpostbox.com',
      subject: 'Confirm Email',
      html: 
        `<html>
        <body>
        <p>Testing SparkPost - the world\'s most awesomest email service!</p>
        <a href="${url}">Confirm Email</a>
        </body>
        </html>`
    },
    options: {
      sandbox: true
    },
    recipients: [
      { address: recipient }
    ]
  });
  console.log(response);
};