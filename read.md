# use of multer for saving file in database?
> Postman ne PDF bheja.

> Multer ne us PDF ko catch kiya aur aapke Node.js server ki RAM (memory) mein 
hold kar liya (memoryStorage).

> Phir aapka code us RAM mein rakhe hue PDF Buffer ko uthata hai.

> Aur final step mein, aapka code us PDF ko Cloudinary par bhejta hai 

# use of cafka
  const file = req.file; this line store file details into variable file. file 
  is inside RAM and RAM mein file ko multer rakhta hai. 



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
