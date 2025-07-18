const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

async function sendEmail(to, subject, text){
    const mailOption = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    }

    return transporter.sendMail(mailOption)
}

module.exports = sendEmail