# use of multer for saving file in database?
> Postman ne PDF bheja.

> Multer ne us PDF ko catch kiya aur aapke Node.js server ki RAM (memory) mein 
hold kar liya (memoryStorage).

> Phir aapka code us RAM mein rakhe hue PDF Buffer ko uthata hai.

> Aur final step mein, aapka code us PDF ko Cloudinary par bhejta hai 

# use of cafka in forgot password ?




  👤 User1   👤 User2   👤 User3   👤 User4   👤 User5
   |          |          |          |          |
   ----------- API Server (Producer) ----------
                        |
                        v
                📦 Kafka Queue (Topic)
          ---------------------------------
          |   Msg1   Msg2   Msg3   Msg4   Msg5 |
          ---------------------------------
              |        |        |
              v        v        v
        📧 Worker1  📧 Worker2  📧 Worker3
           |           |           |
           v           v           v
        Email1     Email2     Email3 ...


    without kafka

👤 User1   👤 User2   👤 User3   👤 User4   👤 User5
   |          |          |          |          |
   ----------- API Server -----------
   |          |          |          |          |
   v          v          v          v          v
                📧 Email Service  
                        |
                        v
                Sending Emails (ONE BY ONE)


Flow:
User1 → wait → email sent
User2 → wait → email sent
User3 → wait → email sent

# use of producer, admin and consumer in kafka ?

> Separate Connections: Haan, Producer (Auth Service) aur Consumer (Utils Service) bilkul anjaan (independent) hain ek dusre se. Dono apna-apna alag TCP connection banate hain us ek Kafka container se.

> Producer ka kaam sirf bhejna: Producer data (message) le jaakar Kafka ke inbox mein daal deta hai aur apna aage ka kaam karta hai.

> Consumer ka kaam uthana: Consumer hamesha dekhta rehta hai ki Kafka ke inbox mein kuch naya aaya kya? Jaise hi aata hai, woh use "pick" karta hai aur real email bhej deta hai.

Admin = Woh aadmi jo aakar raste mein Post-box (Dabba) laga kar jata hai.
Producer = Woh aadmi jo aakar us dabbe mein chitti (letter) daalta hai.
Consumer = Woh postman jo us dabbe se chitti nikal kar aage deliver karta hai.

