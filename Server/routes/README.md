## List of APIs

client = user = device (all the same thing) 

### '/auth/tag'

input: `{ "tReq": Int, "alpha": Int }`

Alpha = trand XOR randClientNumb

tReq = HASH

output: `{ "beta": Int, "tRes": Int }`

Beta = 

### '/auth/client' 

input: `{ "tReq": Int, "dReq": Int, "p": Int }`

output: `{ "tRes": Int, "dRes": Int, "alpha": Int }`

### '/initialize-nfc/client'

input: None

output: `{"cid":#,"crand":###}`

### '/initialize-nfc/tag'


input: None

output: `{"tid":#,"trand":###}`

### '/view-entries'

Input: None

Output: `{"tags":[{"tid":#,"trand":###}],"clients":[{"cid":#,"crand":###}]}`
