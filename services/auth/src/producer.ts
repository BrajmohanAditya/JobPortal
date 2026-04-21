import { Admin, Kafka, Producer } from 'kafkajs';
let producer: Producer;
let admin: Admin;
import dotenv from "dotenv"
dotenv.config();

export const connectKafka = async () => {
    try {
        const kafka = new Kafka({
            clientId: "auth-service",
            brokers: [process.env.KAFKA_BROKER || "localhost:9092"]
        })
        admin = kafka.admin();
        await admin.connect();
        const topics = await admin.listTopics();
        if (!topics.includes("send-mail")) {
            await admin.createTopics({
                topics: [
                    {
                        topic: "send-mail",
                        numPartitions: 1,
                        replicationFactor: 1
                    }
                ]
            })
            console.log("✅ Topic 'send-mail' created")
        }
        await admin.disconnect();


        producer = kafka.producer()

        await producer.connect();

        console.log("✅connected kafka Producer")
    } catch (error) {
        console.log("fail to connect to kafka", error);
    }
}


export const publishToTopic = async (topic: string, message: any) => {
    if (!producer) {
        console.log("kafka producer not connected")
        return;
    }

    try {
        await producer.send({
            topic: topic,
            messages: [
                { value: JSON.stringify(message) }
            ]
        })
    } catch (error) {
        console.log("fail to publish message", error)
    }

}


export const disconnectKafka = async () => {
    if (producer) {
        await producer.disconnect();
        console.log("✅ Kafka producer disconnected")
    }
}