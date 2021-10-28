const web3 = require("web3");

const MAX_GEN0_TOKEN_ID = 9999

const TRAIT_MAP = {
    0: {
        name: 'Hair',
        values: {
            '0': 'Albino',  // ***
            '1': 'Bold',  // **
            '2': 'Red',  // *
            '3': 'Brown',
            '4': 'Blonde',
            '5': 'Black',
        }
    },
    1: {
        name: 'Eyes',
        values: {
            '0': 'Heterochromic',  // ***
            '1': 'Red',  // **
            '2': 'Violet',  // *
            '3': 'Brown',
            '4': 'Green',
            '5': 'Blue',
        }
    },
    2: {
        name: 'Body',
        values: {
            '0': 'Giant',  // ***
            '1': 'Midget',  // **
            '2': 'Anorexic',  // *
            '3': 'Regular',
            '4': 'Fat',
            '5': 'Athletic',
        }
    },
    3: {
        name: 'Sexuality',
        values: {
            '0': 'Virgin',  // ***
            '1': 'Whore',  // **
            '2': 'Pervert',  // *
            '3': 'Hetero',
            '4': 'Bisexual',
            '5': 'Gay/Lesbian',  // todo: detect by gender
        }
    },
    4: {
        name: 'Intelligence',
        values: {
            '0': 'Degen',  // ***
            '1': 'Genius',  // **
            '2': 'Psycho',  // *
            '3': 'Average',
            '4': 'Smart',
            '5': 'Stupid',
        }
    },
    5: {
        name: 'Career',
        values: {
            '0': 'President',  // ***
            '1': 'Sex Worker',  // **
            '2': 'Scientist',  // *
            '3': 'Worker',
            '4': 'Medic',
            '5': 'Clerk',
        }
    },
    6: {
        name: 'Curse',
        values: {
            '0': 'Pyromania',  // ***
            '1': 'Blindness',  // **
            '2': 'Impotence',  // *
            '3': 'Alcoholic',
            '4': 'Drug Addict',
            '5': 'Porn Addict',
        }
    },
    7: {
        name: "God's gift",
        values: {
            '0': 'FOMO',  // ***
            '1': 'Luck',  // **
            '2': 'Longevity',  // *
            '3': 'Empathy',
            '4': 'Not gifted',
            '5': 'Leadership',
        }
    },
}

function genderByTokenId(tokenId) {
    tokenId = +tokenId
    if (tokenId % 2 === 0) {
        return 'Female'
    } else {
        return 'Male'
    }
}

const VALUE_TO_STARS = {
    0: 3,
    1: 2,
    2: 1,
    3: 0,
    4: 0,
    5: 0
}

function decodePersonality(tokenId, traitArr) {
    const traitValues = traitArr.map(a => parseInt(a))

    let entities = {}
    let index = 0
    for (const traitValue of traitValues) {
        const traitDesc = TRAIT_MAP[index]
        entities[traitDesc.name] = traitDesc.values[traitValue]
        ++index
    }
    entities['Gender'] = genderByTokenId(tokenId)
    return entities
}

const SEED = "We Like Fewmans"

function myKeccakBN(items) {
    const coitusHash = web3.utils.keccak256(web3.utils.encodePacked(...items)) // returns string like "0x80..."
    return new web3.utils.BN(coitusHash.slice(2), 16)
}

const PERS_GEN_PROBS = [3, 10, 40, 70];


function initialPersonalityArr(tokenNumber) {
    tokenNumber = +tokenNumber

    let personalityKey = myKeccakBN([
        {type: 'uint16', value: tokenNumber},
        {type: 'string', value: SEED}
    ])

    const res = [0, 0, 0, 0, 0, 0, 0, 0]

    for (let p = 0; p < 8; p++) {
        const pr = personalityKey.modn(100)

        // prettier-ignore
        res[p] = pr < PERS_GEN_PROBS[0] ? 1
            : pr < PERS_GEN_PROBS[1] ? 2
                : pr < PERS_GEN_PROBS[2] ? 3
                    : pr < PERS_GEN_PROBS[3] ? 4
                        : 5;
        personalityKey = personalityKey.divn(100)
    }

    if (tokenNumber < 16) {
        res[tokenNumber & 7] = 0;
    }
    return res
}


function gen0fewman(id) {
    id = +id
    if(id < 0 || id > MAX_GEN0_TOKEN_ID) {
        return null
    }
    return decodePersonality(id, initialPersonalityArr(id), null, 0)
}


module.exports = {
    decodePersonality,
    genderByTokenId,
    initialPersonalityArr,
    gen0fewman,
    TRAIT_MAP,
    VALUE_TO_STARS,
    MAX_GEN0_TOKEN_ID
}
