import userData from "@constants/userData"
import smptData  from "@constants/smptData"

let nodemailer = require('nodemailer')

export default function(req, res) {
    require('dotenv').config()
    
    const mailData = {
        from: req.body.email,
        to: userData.bot_email,
        subject: `Message From ${req.body.name}`,
        text: req.body.message + " | Sent from: " + req.body.email,
        html: `<div>${req.body.message}</div><p>Sent from: ${req.body.email}</p>`
    }
    
    send(mailData)
        .then((data) => {
            let statusCode = getStatusFromTransporterResponse(data.response)
            if(parseTransporterResponse(data.response)) {
                res.status(statusCode).json({status: statusCode, response: 1, responseMessage: "Email successfully sent"})
            } else {
                res.status(statusCode).json({status: statusCode, response: 0, responseMessage: "Email unsuccessfully sent"})
            }
        })
        .catch((error) => {
            console.log("COULD NOT SEND API RESPONSE: %O", error)
        })
}

function getStatusFromTransporterResponse(response) {
    return parseInt(response.split(" ")[0])
}

function parseTransporterResponse(response) {
    return response.includes(smptData.transporter.responseIndicators.success)
}

function send(mailData) {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            port: smptData.transporter.configuration.port,
            host: smptData.transporter.configuration.host,
            auth: {
                user: userData.bot_email,
                pass: process.env.CONTACT_EMAIL_SECRET,
            },
            secure: true,
        })
        transporter.sendMail(mailData, (err, info) => {
            if(err){
                reject(err)
            }else{
                resolve(info)
            }
        })
    })
}