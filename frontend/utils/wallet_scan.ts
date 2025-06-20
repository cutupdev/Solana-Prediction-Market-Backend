import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchAllDigitalAssetWithTokenByOwner } from "@metaplex-foundation/mpl-token-metadata";
import { Connection } from "@solana/web3.js";
import { publicKey } from "@metaplex-foundation/umi";
import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";



// This is wallet scan function
export async function wallet_scan(address: string) {
    try {
        // Create a UMI instance
        let walletInf = { nft: 0, ft: 0 };

        const umi = createUmi(new Connection('https://mainnet.helius-rpc.com/?api-key=3b5315ac-170e-4e0e-a60e-4ff5b444fbcf'));
        umi.use(dasApi());

        // The owner's public key
        const ownerPublicKey = publicKey(
            address,
        );

        // console.log("Fetching NFTs and FTs...");
        const allFTs = await fetchAllDigitalAssetWithTokenByOwner(
            umi,
            ownerPublicKey,
        );
        const allNFTs = await umi.rpc.getAssetsByOwner({ owner: ownerPublicKey });

        // const targetVerifiedAddresses = ["4PZwwu2XRtZACy3NG42h787eyzALi3mtVG2X2H3t6aaE"];
        // const targetUnverifiedAddresses = [
        //     "FZ66RqZ6TQRPwLXmEtxkc3jEud7E4hVNdgmfabGQVLps",
        //     "AuftgQJi8GgTXSXgCv4twvzyiNjAkktHP1JWUbRibsRF"
        // ];

        const targetVerifiedAddresses = [
            "DeHqKTVEx7g9rMcVgmtzV1kBpZhyGJ5d3yuTKnBVtb1T",
            "Eut6aQvJW9VADs6JHKuB8P1d9b64YzEBLVvy7TE6E1Ab"
        ];

        // console.log(`Found ${allNFTs.total} NFTs for the owner:`);

        // console.log(allNFTs)
        allNFTs.items.forEach((nft, index) => {
            // console.log(nft.creators);
            if (nft.creators) {
                const creators = nft.creators;

                const verifiedCreators = creators.filter(c => c.verified);
                const verifiedAddresses = verifiedCreators.map(c => c.address);

                // const unverifiedCreators = creators.filter(c => !c.verified);
                // const unverifiedAddresses = unverifiedCreators.map(c => c.address);

                // Check for exact matches
                const hasExactVerified = verifiedAddresses.length === targetVerifiedAddresses.length &&
                    verifiedAddresses.every(addr => targetVerifiedAddresses.includes(addr));

                // const hasExactUnverified = unverifiedAddresses.length === targetUnverifiedAddresses.length &&
                //     unverifiedAddresses.every(addr => targetUnverifiedAddresses.includes(addr));

                // if (hasExactVerified && hasExactUnverified) {
                //     walletInf.nft = Number(nft.token.amount) / Math.pow(10, nft.mint.decimals);
                // }

                if (hasExactVerified) {
                    walletInf.nft = walletInf.nft + 1;
                }
            }
        });

        allFTs.forEach((ft, index) => {
            if (ft.publicKey === process.env.NEXT_PUBLIC_TOKEN_ADDRESS) {
                walletInf.ft = Number(ft.token.amount) / Math.pow(10, ft.mint.decimals);
            }
        })

        return walletInf;
    } catch (error) {
        console.error("Error:", error);
        return { nft: 0, ft: 0 }
    }
}

function bigintToJSON(key: string, value: any): any {
    return typeof value === 'bigint' ? value.toString() : value;
}