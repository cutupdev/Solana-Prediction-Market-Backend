/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solanalottery.json`.
 */
export type Solanalottery = {
  "address": "AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ",
  "metadata": {
    "name": "solanalottery",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initializeConfig",
      "discriminator": [
        208,
        127,
        21,
        1,
        194,
        190,
        196,
        70
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenLottery",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  84,
                  111,
                  107,
                  101,
                  110,
                  95,
                  76,
                  111,
                  116,
                  116,
                  101,
                  114,
                  121,
                  95,
                  67,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              },
              {
                "kind": "arg",
                "path": "lotteryId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "lotteryId",
          "type": "u64"
        },
        {
          "name": "start",
          "type": "u64"
        },
        {
          "name": "end",
          "type": "u64"
        },
        {
          "name": "price",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "lotteryConfig",
      "discriminator": [
        174,
        54,
        184,
        175,
        81,
        20,
        237,
        24
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "notApproved",
      "msg": "Not approved"
    }
  ],
  "types": [
    {
      "name": "lotteryConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lotteryId",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "winner",
            "type": "u64"
          },
          {
            "name": "winnerChosen",
            "type": "bool"
          },
          {
            "name": "lotteryStart",
            "type": "u64"
          },
          {
            "name": "lotteryEnd",
            "type": "u64"
          },
          {
            "name": "lotteryPotAmount",
            "type": "u64"
          },
          {
            "name": "ticketNum",
            "type": "u64"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "randomnessAccount",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": "pubkey"
          }
        ]
      }
    }
  ]
};
