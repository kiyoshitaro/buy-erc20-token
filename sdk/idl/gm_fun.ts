/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/gm_fun.json`.
 */
export type GmFunType = {
  "address": "HWy1jotHpo6UqeQxx49dpYYdQB8wj9Qk9MdxwjLvDHB8",
  "metadata": {
    "name": "gmFun",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claimAirdrop",
      "discriminator": [
        137,
        50,
        122,
        111,
        89,
        254,
        8,
        20
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "operator",
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config.index",
                "account": "config"
              }
            ]
          }
        },
        {
          "name": "roleAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  108,
                  101,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config"
              },
              {
                "kind": "account",
                "path": "operator"
              }
            ]
          }
        },
        {
          "name": "airdrop",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  105,
                  114,
                  100,
                  114,
                  111,
                  112,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "airdropVaultBase",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  105,
                  114,
                  100,
                  114,
                  111,
                  112,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config"
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ]
          }
        },
        {
          "name": "userTokenBase",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "baseMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tokenAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimGm",
      "discriminator": [
        204,
        63,
        2,
        91,
        11,
        47,
        58,
        18
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "operator",
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config.index",
                "account": "config"
              }
            ]
          }
        },
        {
          "name": "roleAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  108,
                  101,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config"
              },
              {
                "kind": "account",
                "path": "operator"
              }
            ]
          }
        },
        {
          "name": "round",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round.index",
                "account": "round"
              }
            ]
          }
        },
        {
          "name": "gmAirdrop",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  109,
                  95,
                  97,
                  105,
                  114,
                  100,
                  114,
                  111,
                  112,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "round"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "airdropVaultBase",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "config"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "userTokenBase",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tokenAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimToken",
      "discriminator": [
        116,
        206,
        27,
        191,
        166,
        19,
        0,
        73
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "operator",
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config.index",
                "account": "config"
              }
            ]
          }
        },
        {
          "name": "roleAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  108,
                  101,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config"
              },
              {
                "kind": "account",
                "path": "operator"
              }
            ]
          }
        },
        {
          "name": "round",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round.index",
                "account": "round"
              }
            ]
          }
        },
        {
          "name": "vaultPoolBase",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "nativeVault"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "userTokenBase",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "baseMint"
        },
        {
          "name": "nativeVault",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  97,
                  116,
                  105,
                  118,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round"
              }
            ]
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tokenAmounts",
          "type": {
            "vec": "u64"
          }
        }
      ]
    },
    {
      "name": "contribute",
      "discriminator": [
        82,
        33,
        68,
        131,
        32,
        0,
        205,
        95
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config.index",
                "account": "config"
              }
            ]
          }
        },
        {
          "name": "round",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round.index",
                "account": "round"
              }
            ]
          }
        },
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round"
              },
              {
                "kind": "account",
                "path": "pool.mint",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "contribution",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  105,
                  111,
                  110,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round.index",
                "account": "round"
              },
              {
                "kind": "arg",
                "path": "contributionIndex"
              }
            ]
          }
        },
        {
          "name": "roundNativeVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  97,
                  116,
                  105,
                  118,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round"
              }
            ]
          }
        },
        {
          "name": "feeWallet",
          "writable": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "contributionIndex",
          "type": "u64"
        },
        {
          "name": "solAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createPool",
      "discriminator": [
        233,
        146,
        209,
        142,
        207,
        104,
        64,
        188
      ],
      "accounts": [
        {
          "name": "operator",
          "writable": true,
          "signer": true
        },
        {
          "name": "roleAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  108,
                  101,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config"
              },
              {
                "kind": "account",
                "path": "operator"
              }
            ]
          }
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config.index",
                "account": "config"
              }
            ]
          }
        },
        {
          "name": "tokenConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ]
          }
        },
        {
          "name": "baseMint"
        },
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round"
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ]
          }
        },
        {
          "name": "round",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round.index",
                "account": "round"
              }
            ]
          }
        },
        {
          "name": "mainNativeVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  105,
                  110,
                  95,
                  110,
                  97,
                  116,
                  105,
                  118,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config"
              }
            ]
          }
        },
        {
          "name": "roundNativeVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  97,
                  116,
                  105,
                  118,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round"
              }
            ]
          }
        },
        {
          "name": "contribution",
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  105,
                  111,
                  110,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round.index",
                "account": "round"
              },
              {
                "kind": "arg",
                "path": "contribution_index.expect(\"missing contribution index\")"
              }
            ]
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "contributionIndex",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "createRaydiumPool",
      "discriminator": [
        65,
        45,
        119,
        77,
        204,
        178,
        84,
        2
      ],
      "accounts": [
        {
          "name": "ammProgram",
          "address": "HWy1jotHpo6UqeQxx49dpYYdQB8wj9Qk9MdxwjLvDHB8"
        },
        {
          "name": "amm",
          "writable": true
        },
        {
          "name": "ammAuthority"
        },
        {
          "name": "ammOpenOrders",
          "writable": true
        },
        {
          "name": "ammLpMint",
          "writable": true
        },
        {
          "name": "ammCoinMint",
          "writable": true
        },
        {
          "name": "ammPcMint"
        },
        {
          "name": "ammCoinVault",
          "writable": true
        },
        {
          "name": "ammPcVault",
          "writable": true
        },
        {
          "name": "ammTargetOrders",
          "writable": true
        },
        {
          "name": "ammConfig"
        },
        {
          "name": "createFeeDestination",
          "writable": true
        },
        {
          "name": "marketProgram",
          "address": "EoTcMgcDRTJVZDMZWBoU6rhYHZfkNTVEAfz3uUJRcYGj"
        },
        {
          "name": "market"
        },
        {
          "name": "vaultPoolBase",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "nativeVault"
              },
              {
                "kind": "account",
                "path": "baseTokenProgram"
              },
              {
                "kind": "account",
                "path": "ammCoinMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultPoolQuote",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "nativeVault"
              },
              {
                "kind": "account",
                "path": "quoteTokenProgram"
              },
              {
                "kind": "account",
                "path": "ammPcMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultTokenLp",
          "writable": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config.index",
                "account": "config"
              }
            ]
          }
        },
        {
          "name": "roleAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  108,
                  101,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config"
              },
              {
                "kind": "account",
                "path": "operator"
              }
            ]
          }
        },
        {
          "name": "round",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round.index",
                "account": "round"
              }
            ]
          }
        },
        {
          "name": "airdropVaultBase",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  105,
                  114,
                  100,
                  114,
                  111,
                  112,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config"
              },
              {
                "kind": "account",
                "path": "ammCoinMint"
              }
            ]
          }
        },
        {
          "name": "nativeVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  97,
                  116,
                  105,
                  118,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round"
              }
            ]
          }
        },
        {
          "name": "operator",
          "writable": true,
          "signer": true
        },
        {
          "name": "feeWallet",
          "writable": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "baseTokenProgram"
        },
        {
          "name": "quoteTokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "sysvarRent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": "u8"
        },
        {
          "name": "openTime",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createToken",
      "discriminator": [
        84,
        52,
        204,
        228,
        24,
        140,
        234,
        75
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config.index",
                "account": "config"
              }
            ]
          }
        },
        {
          "name": "tokenConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ]
          }
        },
        {
          "name": "baseMint",
          "writable": true,
          "signer": true
        },
        {
          "name": "metadataAccount",
          "docs": [
            "CHECK - address"
          ],
          "writable": true
        },
        {
          "name": "airdropVaultBase",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  105,
                  114,
                  100,
                  114,
                  111,
                  112,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config"
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ]
          }
        },
        {
          "name": "mainNativeVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  105,
                  110,
                  95,
                  110,
                  97,
                  116,
                  105,
                  118,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config"
              }
            ]
          }
        },
        {
          "name": "feeWallet",
          "writable": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "tokenMetadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "initSol",
          "type": "u64"
        }
      ]
    },
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
          "name": "owner",
          "docs": [
            "Address to be set as protocol owner."
          ],
          "writable": true,
          "signer": true,
          "address": "HBFvkYM3gK3rnHiVGxazuSReMtULWcQydSY1TPQLwwgF"
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "index"
              }
            ]
          }
        },
        {
          "name": "mainNativeVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  105,
                  110,
                  95,
                  110,
                  97,
                  116,
                  105,
                  118,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config"
              }
            ]
          }
        },
        {
          "name": "feeWallet"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u16"
        },
        {
          "name": "tradingFee",
          "type": "u64"
        },
        {
          "name": "listingFee",
          "type": "u64"
        },
        {
          "name": "minTokensPerRound",
          "type": "u64"
        },
        {
          "name": "baseLiquidPercent",
          "type": "u64"
        },
        {
          "name": "countDownDuration",
          "type": "u64"
        },
        {
          "name": "airdropAmount",
          "type": "u64"
        },
        {
          "name": "roundCap",
          "type": "u64"
        }
      ]
    },
    {
      "name": "newRound",
      "discriminator": [
        16,
        43,
        233,
        83,
        204,
        132,
        201,
        3
      ],
      "accounts": [
        {
          "name": "operator",
          "writable": true,
          "signer": true
        },
        {
          "name": "roleAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  108,
                  101,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config"
              },
              {
                "kind": "account",
                "path": "operator"
              }
            ]
          }
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config.index",
                "account": "config"
              }
            ]
          }
        },
        {
          "name": "round",
          "writable": true
        },
        {
          "name": "nativeVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  97,
                  116,
                  105,
                  118,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "setRole",
      "discriminator": [
        77,
        78,
        62,
        233,
        192,
        61,
        199,
        190
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config.index",
                "account": "config"
              }
            ]
          }
        },
        {
          "name": "roleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  108,
                  101,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user"
        },
        {
          "name": "owner",
          "docs": [
            "Address to be set as protocol owner."
          ],
          "writable": true,
          "signer": true,
          "address": "HBFvkYM3gK3rnHiVGxazuSReMtULWcQydSY1TPQLwwgF"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "role",
          "type": {
            "defined": {
              "name": "role"
            }
          }
        },
        {
          "name": "active",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updateConfig",
      "discriminator": [
        29,
        158,
        252,
        191,
        10,
        83,
        219,
        99
      ],
      "accounts": [
        {
          "name": "owner",
          "docs": [
            "Address to be set as protocol owner."
          ],
          "writable": true,
          "signer": true,
          "address": "HBFvkYM3gK3rnHiVGxazuSReMtULWcQydSY1TPQLwwgF"
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config.index",
                "account": "config"
              }
            ]
          }
        },
        {
          "name": "newFeeWallet",
          "optional": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tradingFee",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "listingFee",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "minTokensPerRound",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "baseLiquidPercent",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "countDownDuration",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "airdropAmount",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "roundCap",
          "type": {
            "option": "u64"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "airdrop",
      "discriminator": [
        31,
        112,
        159,
        158,
        124,
        237,
        9,
        241
      ]
    },
    {
      "name": "config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        250,
        204,
        130
      ]
    },
    {
      "name": "contribution",
      "discriminator": [
        182,
        187,
        14,
        111,
        72,
        167,
        242,
        212
      ]
    },
    {
      "name": "pool",
      "discriminator": [
        241,
        154,
        109,
        4,
        17,
        177,
        109,
        188
      ]
    },
    {
      "name": "roleAccount",
      "discriminator": [
        142,
        236,
        135,
        197,
        214,
        3,
        244,
        226
      ]
    },
    {
      "name": "round",
      "discriminator": [
        87,
        127,
        165,
        51,
        73,
        78,
        116,
        174
      ]
    },
    {
      "name": "tokenConfig",
      "discriminator": [
        92,
        73,
        255,
        43,
        107,
        51,
        117,
        101
      ]
    }
  ],
  "events": [
    {
      "name": "claimAirdropEvent",
      "discriminator": [
        41,
        2,
        111,
        130,
        182,
        80,
        101,
        157
      ]
    },
    {
      "name": "claimEvent",
      "discriminator": [
        93,
        15,
        70,
        170,
        48,
        140,
        212,
        219
      ]
    },
    {
      "name": "claimGmEvent",
      "discriminator": [
        162,
        2,
        18,
        241,
        194,
        22,
        152,
        174
      ]
    },
    {
      "name": "contributeEvent",
      "discriminator": [
        147,
        4,
        47,
        213,
        204,
        84,
        46,
        189
      ]
    },
    {
      "name": "createPoolEvent",
      "discriminator": [
        177,
        49,
        12,
        210,
        160,
        118,
        167,
        116
      ]
    },
    {
      "name": "createRaydiumV4Event",
      "discriminator": [
        113,
        218,
        159,
        149,
        238,
        116,
        42,
        5
      ]
    },
    {
      "name": "createTokenEvent",
      "discriminator": [
        4,
        4,
        86,
        151,
        191,
        94,
        245,
        193
      ]
    },
    {
      "name": "initializeConfigEvent",
      "discriminator": [
        115,
        64,
        125,
        137,
        211,
        17,
        190,
        43
      ]
    },
    {
      "name": "newRoundEvent",
      "discriminator": [
        214,
        0,
        77,
        174,
        61,
        181,
        226,
        167
      ]
    },
    {
      "name": "setRoleEvent",
      "discriminator": [
        153,
        146,
        95,
        123,
        29,
        113,
        211,
        16
      ]
    },
    {
      "name": "updateConfigEvent",
      "discriminator": [
        96,
        112,
        253,
        102,
        59,
        78,
        75,
        134
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidOwner",
      "msg": "Input account owner is not the program address"
    },
    {
      "code": 6001,
      "name": "invalidContributionOwner",
      "msg": "Invalid contribution owner"
    },
    {
      "code": 6002,
      "name": "invalidOperator",
      "msg": "Invalid operator"
    },
    {
      "code": 6003,
      "name": "invalidFeeWallet",
      "msg": "Invalid fee wallet"
    },
    {
      "code": 6004,
      "name": "invalidAmount",
      "msg": "Invalid amount"
    },
    {
      "code": 6005,
      "name": "capTooLow",
      "msg": "Round cap too low"
    },
    {
      "code": 6006,
      "name": "invalidRound",
      "msg": "Invalid round"
    },
    {
      "code": 6007,
      "name": "invalidPool",
      "msg": "Invalid pool"
    },
    {
      "code": 6008,
      "name": "invalidMint",
      "msg": "Invalid mint"
    },
    {
      "code": 6009,
      "name": "invalidConfig",
      "msg": "Invalid config"
    },
    {
      "code": 6010,
      "name": "invalidNativeVault",
      "msg": "Invalid native vault"
    },
    {
      "code": 6011,
      "name": "mintIsNotOwnedByTokenProgram",
      "msg": "Mint is not owned by token program"
    },
    {
      "code": 6012,
      "name": "tradingFeeTooHigh",
      "msg": "Trading fee too high"
    },
    {
      "code": 6013,
      "name": "listingFeeTooHigh",
      "msg": "Listing fee too high"
    },
    {
      "code": 6014,
      "name": "minTokenPerRoundTooLow",
      "msg": "Min token per round too low"
    },
    {
      "code": 6015,
      "name": "roundEnded",
      "msg": "Round ended"
    },
    {
      "code": 6016,
      "name": "roundNotStartedOrEndedAlready",
      "msg": "Round not started or ended already"
    },
    {
      "code": 6017,
      "name": "roundNotEnded",
      "msg": "Round not ended"
    },
    {
      "code": 6018,
      "name": "insufficientVaultBalance",
      "msg": "Insufficient vault balance"
    },
    {
      "code": 6019,
      "name": "alreadyClaimed",
      "msg": "Contribution already claimed"
    },
    {
      "code": 6020,
      "name": "contributionLengthMismatch",
      "msg": "Contribution length mismatch"
    },
    {
      "code": 6021,
      "name": "contributionKeyMismatch",
      "msg": "Contribution key mismatch"
    },
    {
      "code": 6022,
      "name": "tokenAlreadyAdded",
      "msg": "Token already added to round"
    },
    {
      "code": 6023,
      "name": "baseLiquidPercentTooLow",
      "msg": "Base liquid percent too low"
    },
    {
      "code": 6024,
      "name": "countDownDurationTooLow",
      "msg": "Count down duration too low"
    },
    {
      "code": 6025,
      "name": "airdropAmountTooHigh",
      "msg": "Airdrop amount too high"
    },
    {
      "code": 6026,
      "name": "invalidContributionLength",
      "msg": "Invalid contribution length"
    },
    {
      "code": 6027,
      "name": "invalidTopMint",
      "msg": "Invalid top mint"
    }
  ],
  "types": [
    {
      "name": "airdrop",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "claimAirdropEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "tokenAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "claimEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "round",
            "type": "pubkey"
          },
          {
            "name": "roundIndex",
            "type": "u64"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "contributionIndexes",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "totalTokenClaimed",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "claimGmEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "round",
            "type": "pubkey"
          },
          {
            "name": "roundIndex",
            "type": "u64"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "tokenAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "docs": [
              "Config version"
            ],
            "type": "u8"
          },
          {
            "name": "index",
            "docs": [
              "Config index"
            ],
            "type": "u16"
          },
          {
            "name": "bump",
            "docs": [
              "Bump to identify PDA"
            ],
            "type": "u8"
          },
          {
            "name": "mainNativeVaultBump",
            "type": "u8"
          },
          {
            "name": "owner",
            "docs": [
              "Owner of the protocol"
            ],
            "type": "pubkey"
          },
          {
            "name": "feeWallet",
            "docs": [
              "Owner of the protocol"
            ],
            "type": "pubkey"
          },
          {
            "name": "tradingFee",
            "type": "u64"
          },
          {
            "name": "listingFee",
            "type": "u64"
          },
          {
            "name": "lastRoundIndex",
            "type": "u64"
          },
          {
            "name": "minTokensPerRound",
            "type": "u64"
          },
          {
            "name": "baseLiquidPercent",
            "type": "u64"
          },
          {
            "name": "countDownDuration",
            "type": "u64"
          },
          {
            "name": "airdropAmount",
            "type": "u64"
          },
          {
            "name": "roundCap",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "contributeEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "round",
            "type": "pubkey"
          },
          {
            "name": "roundIndex",
            "type": "u64"
          },
          {
            "name": "pool",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "contribution",
            "type": "pubkey"
          },
          {
            "name": "contributionIndex",
            "type": "u64"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "poolSolReserves",
            "type": "u64"
          },
          {
            "name": "roundTotalSolReserves",
            "type": "u64"
          },
          {
            "name": "solAmount",
            "type": "u64"
          },
          {
            "name": "topPool",
            "type": "pubkey"
          },
          {
            "name": "topPoolSolReserves",
            "type": "u64"
          },
          {
            "name": "isFlipped",
            "type": "bool"
          },
          {
            "name": "endTime",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "contribution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "index",
            "type": "u64"
          },
          {
            "name": "configIndex",
            "type": "u16"
          },
          {
            "name": "roundIndex",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "solAmount",
            "type": "u64"
          },
          {
            "name": "claimedAmount",
            "type": "u64"
          },
          {
            "name": "claimed",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "createPoolEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "round",
            "type": "pubkey"
          },
          {
            "name": "roundIndex",
            "type": "u64"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "pool",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "createRaydiumV4Event",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "round",
            "type": "pubkey"
          },
          {
            "name": "operator",
            "type": "pubkey"
          },
          {
            "name": "baseToken",
            "type": "pubkey"
          },
          {
            "name": "quoteToken",
            "type": "pubkey"
          },
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "amm",
            "type": "pubkey"
          },
          {
            "name": "initBaseAmount",
            "type": "u64"
          },
          {
            "name": "initQuoteAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "createTokenEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "initSol",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "initializeConfigEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "configIndex",
            "type": "u16"
          },
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "feeWallet",
            "type": "pubkey"
          },
          {
            "name": "tradingFee",
            "type": "u64"
          },
          {
            "name": "listingFee",
            "type": "u64"
          },
          {
            "name": "minTokensPerRound",
            "type": "u64"
          },
          {
            "name": "baseLiquidPercent",
            "type": "u64"
          },
          {
            "name": "countDownDuration",
            "type": "u64"
          },
          {
            "name": "airdropAmount",
            "type": "u64"
          },
          {
            "name": "roundCap",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "newRoundEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "round",
            "type": "pubkey"
          },
          {
            "name": "roundIndex",
            "type": "u64"
          },
          {
            "name": "nativeVault",
            "type": "pubkey"
          },
          {
            "name": "cap",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "round",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "solReserves",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "role",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "operator"
          }
        ]
      }
    },
    {
      "name": "roleAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "docs": [
              "User pubkey associated with the role"
            ],
            "type": "pubkey"
          },
          {
            "name": "role",
            "docs": [
              "Role of the user"
            ],
            "type": {
              "defined": {
                "name": "role"
              }
            }
          },
          {
            "name": "active",
            "docs": [
              "Flag to control if the role is active"
            ],
            "type": "bool"
          },
          {
            "name": "bump",
            "docs": [
              "Bump to identify PDA"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "round",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "index",
            "type": "u64"
          },
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "nativeVault",
            "type": "pubkey"
          },
          {
            "name": "nativeVaultBump",
            "type": "u8"
          },
          {
            "name": "topPool",
            "type": "pubkey"
          },
          {
            "name": "topMint",
            "type": "pubkey"
          },
          {
            "name": "topSolReserves",
            "type": "u64"
          },
          {
            "name": "totalSolReserves",
            "type": "u64"
          },
          {
            "name": "endTime",
            "type": "u64"
          },
          {
            "name": "cap",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "roundStatus"
              }
            }
          },
          {
            "name": "totalContribution",
            "type": "u64"
          },
          {
            "name": "totalTokens",
            "type": "u64"
          },
          {
            "name": "flipCount",
            "type": "u64"
          },
          {
            "name": "ammId",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "roundStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "open"
          },
          {
            "name": "started"
          },
          {
            "name": "pump"
          },
          {
            "name": "listed"
          }
        ]
      }
    },
    {
      "name": "setRoleEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "role",
            "type": {
              "defined": {
                "name": "role"
              }
            }
          },
          {
            "name": "active",
            "type": "bool"
          },
          {
            "name": "config",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "tokenConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "initSol",
            "type": "u64"
          },
          {
            "name": "isAdded",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "updateConfigEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "configIndex",
            "type": "u16"
          },
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "feeWallet",
            "type": "pubkey"
          },
          {
            "name": "tradingFee",
            "type": "u64"
          },
          {
            "name": "listingFee",
            "type": "u64"
          },
          {
            "name": "minTokensPerRound",
            "type": "u64"
          },
          {
            "name": "baseLiquidPercent",
            "type": "u64"
          },
          {
            "name": "countDownDuration",
            "type": "u64"
          },
          {
            "name": "airdropAmount",
            "type": "u64"
          },
          {
            "name": "roundCap",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "airdropSeed",
      "type": "bytes",
      "value": "[97, 105, 114, 100, 114, 111, 112, 95, 115, 101, 101, 100]"
    },
    {
      "name": "airdropTokenVaultSeed",
      "type": "bytes",
      "value": "[97, 105, 114, 100, 114, 111, 112, 95, 116, 111, 107, 101, 110, 95, 118, 97, 117, 108, 116, 95, 115, 101, 101, 100]"
    },
    {
      "name": "configSeed",
      "type": "bytes",
      "value": "[99, 111, 110, 102, 105, 103, 95, 115, 101, 101, 100]"
    },
    {
      "name": "contributionSeed",
      "type": "bytes",
      "value": "[99, 111, 110, 116, 114, 105, 98, 117, 116, 105, 111, 110, 95, 115, 101, 101, 100]"
    },
    {
      "name": "gmAirdropSeed",
      "type": "bytes",
      "value": "[103, 109, 95, 97, 105, 114, 100, 114, 111, 112, 95, 115, 101, 101, 100]"
    },
    {
      "name": "mainNativeVaultSeed",
      "type": "bytes",
      "value": "[109, 97, 105, 110, 95, 110, 97, 116, 105, 118, 101, 95, 118, 97, 117, 108, 116, 95, 115, 101, 101, 100]"
    },
    {
      "name": "nativeVaultSeed",
      "type": "bytes",
      "value": "[110, 97, 116, 105, 118, 101, 95, 118, 97, 117, 108, 116, 95, 115, 101, 101, 100]"
    },
    {
      "name": "poolSeed",
      "type": "bytes",
      "value": "[112, 111, 111, 108, 95, 115, 101, 101, 100]"
    },
    {
      "name": "roleSeed",
      "type": "bytes",
      "value": "[114, 111, 108, 101, 95, 115, 101, 101, 100]"
    },
    {
      "name": "roundSeed",
      "type": "bytes",
      "value": "[114, 111, 117, 110, 100, 95, 115, 101, 101, 100]"
    },
    {
      "name": "tokenSeed",
      "type": "bytes",
      "value": "[116, 111, 107, 101, 110, 95, 115, 101, 101, 100]"
    },
    {
      "name": "tokenVaultSeed",
      "type": "bytes",
      "value": "[116, 111, 107, 101, 110, 95, 118, 97, 117, 108, 116, 95, 115, 101, 101, 100]"
    }
  ]
};
