# Client

Make sure to use python3! 

To run the client: `python3 main.py`

## Using the Client

The client is command based, it accepts commands to execute. 

### Commands
1. Create New User
   - Creates a new user on the server
2. Add a new tag
   - Creates a new tag on the server then writes to the tag on the device. 
3. Authenticate Tag & User
   - Reads the tag then authenticates the client and tag on the server then writes the new tag information
4. Authenticate Tag Only
    - Reads the tag, authenticates the tag on the server then writes the new tag information
5. View All Entries (Client & Tag)
   - Displays the client and tag entries on the server in list format. 
6. Read Tag Data Only
   - Displays the information on the tag (Note: Only displays the first text record on the tag)
7. BAD: Corrupt Tag
   - **DANGER** Will write to the tag new data that is incorrect.  
8. BAD: Corrupt User
   - **DANGER** Will change the current user's data that it can't be authenticated 
9. Exit program
    - Safely close the program. 