const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const admin = require("firebase-admin");

const app = express();

// Set static path
app.use(express.static(path.join(__dirname, "client")));

app.use(bodyParser.json());

// Initialize Firebase Admin SDK with your Firebase project's credentials
const serviceAccount = require("./check-33d5a-firebase-adminsdk-7gcrx-72727f58e6.json"); 
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

app.post("/subscribe", async (req, res) => {
    const subscription = req.body;

    if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ error: "Invalid subscription object" });
    }

    // Log the received subscription
    console.log("Received subscription:", subscription);

    res.status(201).json({});

    try {
        // Create a Firestore database reference
        const db = admin.firestore();
        await db.collection("subscriptions").add(subscription);

        // Logging statement to confirm subscription addition
        console.log("Subscription added to Firestore:", subscription);
        const payload = {
            notification: {
                title: "Push Notification",
                body: "Notified by Team Coders",
            },
        };

        // Send the notification to all subscribed devices
        const response = await admin
            .messaging()
            .sendToTopic("notifications", payload);
        console.log("Notification sent successfully:", response);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const port = 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));

// Service worker code remains unchanged
console.log("Service worker loaded");