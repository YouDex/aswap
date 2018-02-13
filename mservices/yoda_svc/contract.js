module.exports = {
    'address': '0x4bf6238bbe4f121ed28eb0c3036bff9a1d81d289',
    'abi': [{
            "constant": true,
            "inputs": [],
            "name": "ORDER",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [{
                    "name": "_maker",
                    "type": "address"
                },
                {
                    "name": "_plasmoid",
                    "type": "address"
                },
                {
                    "name": "_ethAmount",
                    "type": "uint256"
                },
                {
                    "name": "_btcAmount",
                    "type": "uint256"
                },
                {
                    "name": "_YODAamount",
                    "type": "uint256"
                }
            ],
            "name": "openDEx",
            "outputs": [{
                "name": "",
                "type": "uint16"
            }],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [{
                "name": "_order",
                "type": "uint256"
            }],
            "name": "inDepo",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [{
                    "name": "_order",
                    "type": "uint256"
                },
                {
                    "name": "_dealer",
                    "type": "address"
                }
            ],
            "name": "outDepo",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [{
                    "name": "_order",
                    "type": "uint256"
                },
                {
                    "name": "_maker",
                    "type": "address"
                },
                {
                    "name": "_taker",
                    "type": "address"
                },
                {
                    "name": "_ethAmount",
                    "type": "uint256"
                },
                {
                    "name": "_btcAmount",
                    "type": "uint256"
                },
                {
                    "name": "_YODAamount",
                    "type": "uint256"
                }
            ],
            "name": "closeDEx",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "VERSION",
            "outputs": [{
                "name": "",
                "type": "string"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [{
                    "indexed": true,
                    "name": "_order",
                    "type": "uint256"
                },
                {
                    "indexed": true,
                    "name": "maker",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "taker",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "plasmoid",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "ethAmount",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "btcAmount",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "pledgeYODAamount",
                    "type": "uint256"
                }
            ],
            "name": "StartDEx",
            "outputs": [{
                "name": "",
                "type": "string"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "event",
            "anonymous": false
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": true,
                    "name": "_order",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "maker",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "taker",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "plasmoid",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "ethAmount",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "btcAmount",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "pledgeYODAamount",
                    "type": "uint256"
                }
            ],
            "name": "StopDEx",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "_order",
                "type": "uint256"
            }],
            "name": "InDepo",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": true,
                    "name": "_order",
                    "type": "uint256"
                },
                {
                    "indexed": true,
                    "name": "_dealer",
                    "type": "address"
                }
            ],
            "name": "OutDepo",
            "type": "event"
        }
    ]
}