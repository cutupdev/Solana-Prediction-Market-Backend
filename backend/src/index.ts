import express, { Response, Request } from "express";
import cors from "cors";
import http from "http";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import { COOL_DOWN, WAITING_PERIOD, BACKEND_WALLET, MINT_ADDRESS } from "./config";
import {  withdrawAble, spinsAndJackpots, getHistory, getJackpot, getResult, getSpinPool, getUserpool, init, getTotalUserBalance, getUserFutureSpins, getLeaderboard, getStates, findNextJackpots, getSpinNumber, sendToExplorer } from "./db";
import { autoDepositIx, getJackpotAmount, performTx, transferFromBackend } from "./script";
import { defaultLogger, authLogger, errorLogger, logLogger } from "./logger";
import dotenv from "dotenv"
import { wallet_scan, getTokenPrice } from "./utils";
import { spinModel } from './model/spin_pool';
import { faucetUserModel } from './model/faucet_user';
import { isFaucetable, distributeToken, isValidSolanaAddress, getFaucetAmount, iscNFT } from "./faucet";

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

const whitelist = [
    "http://localhost:3000",
    "http://localhost:5000",
];
const corsOptions = {
    origin: whitelist,
    credentials: false,
    sameSite: "none",
};

const server = http.createServer(app);
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


let counter = 0;

const io = new Server(server, {
    cors: {
        origin: whitelist,
        credentials: false
    },
    // transports: ["websocket"],
    pingInterval: 10000,
    pingTimeout: 2000,
});

app.get("/", async (req: any, res: any) => {
    res.send("Backend Server is Running now!");
});

io.on("connection", (socket) => {
    // console.log(" --> ADD SOCKET", counter);
    counter++;
    io.emit("connectionUpdated", counter);
    socket.on("disconnect", () => {
        // console.log(" --> REMOVE SOCKET", counter);
        counter--;
        io.emit("connectionUpdated", counter);
    });
});

app.get('/getWheel', async (req: Request, res: Response) => {
    try {
        console.log('Explorer call for wheel data ...')
        await sendToExplorer(io);
        res.json({ success: true })
    } catch (err) {
        console.log('error getting wheel data ===> ', err)
        res.status(500).json({ success: false })
    }
})

app.post("/requestDeposit", async (req, res) => {
    logLogger.log(`Request Entering ===> ${req.body.address}, amount ===> ${req.body.amount}`);
    const timestamp = new Date().getTime();
    const recentStartTime = timestamp - timestamp % COOL_DOWN;

    try {
        const user = req.body.address as string;
        const amount = req.body.amount as string;
        const times = req.body.times as string;

        const amt = parseInt(amount);
        const jackpotAmt = (await getJackpotAmount())?.amount;

        if (jackpotAmt === undefined || jackpotAmt === null) {
            res.status(500).json("");
            return;

        }
        if (timestamp - recentStartTime >= WAITING_PERIOD) {
            res.status(503).json("You can't deposit at this time!");
            return;
        }

        const spinResults = await getSpinPool(timestamp);
        const backendBalance = (await wallet_scan(BACKEND_WALLET)).ft;

        if (spinResults === undefined) {
            if (Number(amount) > backendBalance * 100) {
                res.status(400).json("Deposit Amount is Larger than Limit!")
                return;
            }
        } else if (Array.isArray(spinResults) && spinResults.length > 0) {
            const firstResult = spinResults[0];

            // Safely extract total_wager with optional chaining
            const totalWager = firstResult?.total_wager ?? 0; // Default to 0 if total_wager is undefined

            console.log("amount: ", amount, "total_wager: ", totalWager, "backend: ", backendBalance)
            if ((Number(amount) + totalWager) * 10 > backendBalance * 1000) {
                res.status(400).json("Deposit Amount is Larger than Limit!")
                return;
            }
        }

        // // backend wallet TOKE amount get, spin TOKE + wiger vs backend wallet amount 10%, 
        // if (spinResult === undefined) {
        //     if (amt > jackpotAmt * 10 / 100) {
        //         res.status(400).json("Deposit Amount is Larger than Limit!")
        //         return;
        //     }
        // } else {
        //     if (spinResult[0] && spinResult[0].players) {
        //         const players = spinResult[0].players;

        //         // same compare logic, not find user
        //         let result = players.find(x => x.address === user);
        //         if (result) {
        //             res.status(400).json("Deposit Amount is Larger than Limit!")
        //             return;
        //         }
        //     }
        // }

        const result = await autoDepositIx(recentStartTime, user, parseInt(amount), parseInt(times), io);
        if (!result) {
            res.status(200).json("Deposit Success!")
            return;
        }
        res.json({ success: true });
    } catch (error) {
        console.error("Error on requestDeposit: ", error)
        res.json({ success: false });
    }
});

app.post("/getUserAmount", async (req, res) => {
    // console.log("----> Get User Amount");

    try {
        const user = req.body.address as string;

        const result = await getUserpool(user);
        // console.log(result)

        if (!result || result !== null || result !== 0) {
            // console.log(result)
            res.status(200).send(result?.toString())
        }
    } catch (error) {
        console.error("Error on getUserAmount: ", error)
        res.json({ success: false });
    }
});

app.post("/getSpinStatus", async (req, res) => {
    // console.log("----> New spin starting");
    init()

    try {
        const ts = req.body.timestamp as string;

        const result = await getSpinPool(parseInt(ts));
        // console.log("result ===> ", result);

        res.status(200).json(result)
    } catch (error) {
        console.error("Error on getSpinStatus: ", error)
        res.json({ success: false });
    }
});

app.post("/getJackpot", async (req, res) => {
    // console.log("----> Get Jackpot Amount");
    init()

    try {
        const result = await getJackpot();
        // console.log("Jackpot:  ", result)

        res.status(200).send({ result })
    } catch (error) {
        console.error("Error on getJackpot: ", error)
        res.json({ success: false });
    }
});

app.post("/getHistory", async (req, res) => {
    // console.log("----> Get History");
    init()

    try {
        const result = await getHistory();
        // console.log("Get History:  ", result)

        res.status(200).json(result)
    } catch (error) {
        console.error("Error on getHistory: ", error)
        res.json({ success: false });
    }
});


app.post("/performTx", async (req, res) => {
    // console.log("----> Perform Tx");
    logLogger.log(`Request Deposit ===> ${req.body.address}`);
    try {
        const tx = req.body.tx as string;
        const address = req.body.address as string;

        const result = await performTx(address, tx, io);

        res.status(200).send("")
    } catch (error) {
        console.error("Error on performTx: ", error)
        res.json({ success: false });
    }
});

app.post("/withdrawToken", async (req, res) => {
    // console.log("----> withdraw Token Tx");

    try {
        const address = req.body.address as string;
        const able = await withdrawAble(address);

        if (!able) {
            return res.status(400).json("You can't withdraw right now");
        }

        const amount = req.body.amount as string;

        const result = await transferFromBackend(address, parseInt(amount), io);

        if (result === 0) res.status(400).json("Invaild Withdraw Amount");

        res.status(200).send("")
    } catch (error) {
        console.error("Error on withdrawToken: ", error)
        res.json({ success: false });
    }
});

app.get("/getTotalUserBalance", async (req, res) => {
    try {
        // console.log('getTotalUserBalance api called');
        const totalAmount = await getTotalUserBalance();
        // console.log('total user balance ===> ', totalAmount)
        res.json({ total: totalAmount });
    } catch (error) {
        console.error("Get getTotalUserBalance Error: ", error);
        res.json({ total: 0 });
    }
})

app.post('/getUserFutureSpins', async (req, res) => {
    try {
        // console.log('getUserFutureSpins api called');
        const futureSpins = await getUserFutureSpins(req.body.players, req.body.timestamps);
        // console.log('Future spin lists ===>', futureSpins);
        res.json({ spinLists: futureSpins });
    } catch (error) {
        console.error('Get user future spins error: ', error);
        res.json({ spinLists: [] });
    }
})

app.get('/getPastAndFuture', async (req, res) => {
    const firstTs = new Date().getTime();
    try {
        await spinsAndJackpots(firstTs - firstTs % COOL_DOWN, io)
        res.json({ sucess: true });
    } catch (err) {
        console.log("error during get past and future ===> ", err);
        res.json({ sucess: false });
    }
})

app.get('/getLeaderboard', async (req, res) => {
    try {
        await getLeaderboard(io);
        res.json({
            success: true
        })
    } catch (err) {
        res.json({
            success: false
        })
    }
})

app.get('/getStates', async (req, res) => {
    try {
        await getStates(io);
        res.json({
            success: true
        })
    } catch (err) {
        console.log("error during get get stats ===> ", err);
        res.json({
            success: false
        })
    }
})

app.post('/walletScan', async (req, res) => {
    try {
        const address = req.body.address;
        const walletInf = await wallet_scan(address);
        res.json({
            success: true,
            walletInf: walletInf
        })
    } catch (err) {
        console.log("error during get stats ===> ", err);
        res.json({
            success: false
        })
    }
})

app.post('/getTokenPrice', async (req, res) => {
    try {
        const address = req.body.address as string;
        const price = await getTokenPrice(address);
        res.json({
            success: true,
            price: price
        })
    } catch (err) {
        console.log("error during get stats ===> ", err);
        res.json({
            success: false
        })
    }
})

app.get('/initialBrowser', async (req, res) => {
    try {
        const firstTs = new Date().getTime();
        await getSpinNumber(io);
        await spinsAndJackpots(firstTs - firstTs % COOL_DOWN, io)
        res.json({ sucess: true });
    } catch (err) {
        console.log("error during initial browser localstorage ===> ", err);
        res.json({ sucess: false });
    }
})

app.post('/faucet', async (req, res) => {
    console.log("faucet router was called!")
    try {
        const walletAddress = req.body.address;
        const faucetable = await isFaucetable(walletAddress, res);
        console.log("faucetable ===> ", faucetable)
        if (!faucetable) {
            return;
        }

        await faucetUserModel.updateOne({ walletAddress: walletAddress }, { $set: { lastHit: new Date(), process: 'doing' } });
        logLogger.log(`New faucet attempting, wallet address ===> ${walletAddress}`)

        // Validate the wallet address
        if (!isValidSolanaAddress(walletAddress)) {
            return res.status(400).send({ success: false, msg: "Invalid Solana address." });
        }

        // Find user in database or create a new record
        let user = await faucetUserModel.findOne({ walletAddress: walletAddress });
        if (!user) {
            user = new faucetUserModel({ walletAddress: walletAddress });
            await user.save();
        }

        // Faucet Amount 
        let faucetAmount = await getFaucetAmount();
        const isNFT = await iscNFT(walletAddress);
        if (isNFT) {
            faucetAmount *= 1.1;
        }

        // Attempt to distribute tokens
        const transferResult = await distributeToken(walletAddress, MINT_ADDRESS, parseFloat(faucetAmount.toFixed(3)));

        if (transferResult) {
            // Update user record with last hit time
            await faucetUserModel.updateOne({ walletAddress: walletAddress }, { $set: { lastHit: new Date(), lastAmount: parseFloat(faucetAmount.toFixed(3)), process: 'sent' } });

            return res.status(200).send({ success: true, amount: faucetAmount })
        } else {
            await faucetUserModel.updateOne({ walletAddress: walletAddress }, { $set: { lastHit: new Date(), lastAmount: parseFloat(faucetAmount.toFixed(3)), process: 'failed' } });
            
            return res.status(400).send({ success: false, msg: "Transaction confirmation error" });
        }
    } catch (err) {
        console.log('error getting machine data ===> ', err)
        res.status(500).json({ success: false, msg: "Someting went wrong. Please try again." })
    }
})



function bigintToJSON(key: string, value: any): any {
    return typeof value === 'bigint' ? value.toString() : value;
}

app.post("/test", async (req, res) => {
    try {
        const firstTs = new Date().getTime();
        const spinNumber = Math.floor(firstTs - firstTs % COOL_DOWN);
        const results = await spinModel.aggregate([
            {
                $match: {
                    start_timestamp: {
                        $gte: spinNumber - 12000000, // Start timestamp greater than or equal to A
                        $lte: spinNumber  // Start timestamp less than or equal to B
                    }
                }
            },
            {
                $sort: { start_timestamp: -1, updatedAt: -1 } // Sort by start_timestamp ascending & updatedAt descending
            },
            {
                $group: {
                    _id: "$start_timestamp", // Group by start_timestamp
                    entrants: { $first: "$entrants" },
                    updatedAt: { $first: "$updatedAt" }, // Keep the most recent updatedAt
                    players: { $first: "$players" } // Get the player data
                }
            },
            {
                $project: {
                    start_timestamp: "$_id",
                    playerCount: { $size: "$players" }, // Count the number of players
                }
            },
            {
                $sort: { start_timestamp: -1 } // Sort the results by start_timestamp descending
            },
            {
                $limit: 100 // Get the last 100 entries
            }
        ]);

        console.log('participants per every 100 spins ===> ', results); // This will return the formatted data including participant counts
    } catch (error) {
        console.error("Error fetching spin participants:", error);
        throw error; // Rethrow or handle it as needed
    }
});

server.listen(port, async () => {
    console.log(`server is listening on ${port}`);
    // attachRewardTransactionListener(io);
    let ts = new Date().getTime();
    init()

    let initialDelay;
    if (WAITING_PERIOD > ts % COOL_DOWN) initialDelay = WAITING_PERIOD - ts % COOL_DOWN;
    else initialDelay = WAITING_PERIOD + COOL_DOWN - ts % COOL_DOWN;
    // console.log("Now:  ", ts)

    setTimeout(async () => {
        const firstTs = new Date().getTime();
        // console.log("First Input", firstTs)
        await getResult(firstTs - firstTs % COOL_DOWN, io);
        await spinsAndJackpots(firstTs - firstTs % COOL_DOWN, io)
        setInterval(async () => {
            const ts = new Date().getTime();
            const stTimestamp = ts - ts % COOL_DOWN;
            // console.log("Interval: ", ts)

            getResult(stTimestamp, io);
            // await sleep(31000);
            spinsAndJackpots(stTimestamp, io);
        }, COOL_DOWN);
    }, initialDelay)

    return;
});
