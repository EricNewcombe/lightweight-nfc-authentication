import nfc
from tkinter import *


def main():
    r = Tk()
    r.title('lightweight-nfc-authentication')
    c = Canvas(master=r, width=500, height=500)
    c.pack()
    w = Frame(master=c)
    w.pack()
    button = Button(master=w, text='Stop', width=25, command=r.destroy)
    
    l1 = Label(master=w, text="Lightweight NFC Authentication")
    l1.grid(row=0, column=1, columnspan=2)
    l2 = Label(master=w, text="Sign In")
    l2.grid(row=1, column=1)
    button.grid(row=1, column=2)
    #w.pack()
    mainloop()


    print("Hello world")

main()
