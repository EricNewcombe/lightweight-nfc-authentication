## List of APIs

### '/auth/tag'

input: `{ tReq: Int, alpha: Int }`

output: `{ beta: Int, tRes: Int }`

### '/auth/client' 

input: `{ tReq: Int, dReq: Int, p: Int }`

output: `{ tRes: Int, dRes: Int, alpha: Int }`

### '/initialize-nfc/client'

input: None

output: `{"cid":#,"crand":###}`

### '/initialize-nfc/tag'


input: None

output: `{"tid":#,"trand":###}`

### '/view-entries'

Input: None

Output: `{"tags":[{"tid":#,"trand":###}],"clients":[{"cid":#,"crand":###}]}`
