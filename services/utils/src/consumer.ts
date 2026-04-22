import { Kafka } from "kafkajs";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export const startSendMailConsumer = async () => {


    try {
        const kafka = new Kafka({
            clientId: "mail-service",
            brokers: [process.env.KAFKA_BROKERS || "localhost:9092"],
        });

        const consumer = kafka.consumer({ groupId: "mail-service-group" });

        await consumer.connect();
        await consumer.subscribe({ topic: "send-mail", fromBeginning: false });

        console.log("✅ Mail service consumer started, listening for sending mail")

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const { to, subject, html } = JSON.parse(message.value?.toString() || "{}")

                    const transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 465,
                        secure: true,
                        auth: {
                            user: "xyz",
                            pass: "yzx",
                        }
                    })
                    await transporter.sendMail({ from: "Hireheven <no-reply>", to, subject, html })
                    console.log(`✅ Mail sent to ${to}`)
                } catch (error) {
                    console.log("❌ Failed to send email", error);
                }
            }
        })
    } catch (error) {
        console.log("failed to start kafka");
    }
}


