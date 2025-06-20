import axios from "axios";
import {
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
  Transaction,
  Keypair,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout  } from "@solana/spl-token";

export async function get_nft_api_rec(url: any, mint: any) {
    try {
      const response = await axios.get(url);
      // console.log(response.data.collection.name + '-' + response.status)
      if (response.status == 200) {
        let ColName = '';
        let collectionName = '';
        let familyName = '';
        if (response.data.collection) {
          if (typeof (response.data.collection) === 'string') {
            collectionName = response.data.collection;
          } else if (response.data.collection.name) {
            collectionName = response.data.collection.name;
          }
          if (response.data.collection.family) {
            familyName = response.data.collection.family;
          }
        }

        if (ColName == '') {
          const colArray = response.data.name.split(" #");
          ColName = colArray['0'];
        }

        const nftArray = response.data.name.split("#");
        let nftName = nftArray['1'] ? nftArray['1'] : response.data.name;
        return {
          mint: mint,
          projectname: ColName ? ColName : '',
          collectionname: collectionName,
          familyname: familyName,
          nftname: nftName,
          image: response.data.image,
          symbol: response.data.symbol,
          attributes: response.data.attributes,
          url: url
        };
      }
    } catch (error) {
      console.error(error, "error in get_nft_api_rec");
    }
  }

  export const getNFTTokenAccount = async (nftMintPk: PublicKey, connection: Connection): Promise<PublicKey> => {
    console.log("getNFTTokenAccount nftMintPk=", nftMintPk.toBase58());
    let tokenAccount = await connection.getProgramAccounts(
      TOKEN_PROGRAM_ID,
      {
        filters: [
          {
            dataSize: 165
          },
          {
            memcmp: {
              offset: 64,
              bytes: '2'
            }
          },
          {
            memcmp: {
              offset: 0,
              bytes: nftMintPk.toBase58()
            }
          },
        ]
      }
    );
    return tokenAccount[0].pubkey;
  }