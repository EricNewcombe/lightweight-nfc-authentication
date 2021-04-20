# Client

Make sure to use python3! 

To run the client: `python3 main.py`

## Using the Client

The client is command based, it accepts commands to execute. 

Most comman usage will be to run 1 then 2 then 3. This will create a new user on the server, then create a new tag and write to it, the finally authenticate the user and tag together. 

### Commands
1. Create New User
   - [/initialize-nfc/client](../Server/routes/README.md#initialize-nfcclient)
   - Creates a new user on the server
2. Add a new tag
   - [/initialize-nfc/tag](../Server/routes/README.md#initialize-nfctag)
   - Creates a new tag on the server then writes to the tag on the device. 
3. Authenticate Tag & User
   - [/auth/client](../Server/routes/README.md#authclient)
   - Reads the tag then authenticates the client and tag on the server then writes the new tag information
4. Authenticate Tag Only
   - [/auth/tag](../Server/routes/README.md#authtag)
    - Reads the tag, authenticates the tag on the server then writes the new tag information
5. View All Entries (Client & Tag)
   - [/view-entries](../Server/routes/README.md#view-entries)
   - Displays the client and tag entries on the server in list format. 
6. Read Tag Data Only
   - Displays the information on the tag (Note: Only displays the first text record on the tag)
7. BAD: Corrupt Tag
   - **DANGER** Will write to the tag new data that is incorrect.  
8. BAD: Corrupt User
   - **DANGER** Will change the current user's data that it can't be authenticated 
9. Exit program
    - Safely close the program. 