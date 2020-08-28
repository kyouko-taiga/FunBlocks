import * as AST from 'FunBlocks/AST'

export class DrawingCanvas {

    // Class used for manipulating the canvas. It allows to set the position of the "pencil". It handles also the forms to draw and the color to use.



    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    // position of the pencil. used to set the position of the forms
    private posX: number
    private posY: number


    public clearCanvas(){
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height)
    }

    // Function modifying the posY
    public Y(i?: number){
        if (Number.isInteger(i)){
            this.posY += 55 * i
        }else{
            if (this.posY + 55 < this.canvas.width) {
                this.posY += 55
            }else{
                this.canvas.width += 55
                this.posY += 55
            }
        }
    }

    // Function modifying the posX
    public X(i?: number){
        if (Number.isInteger(i)){
            this.posX += 55 * i
        }else{
            if (this.posX + 55 < this.canvas.height) {
                this.posX += 55
            }else {
                this.canvas.height += 55
                this.posX += 55
            }
        }
    }

    // Give the instruction to the canvas for what to draw. Handle the syntax errors in the terms.
    public draw(Shape: string) {
        if (Shape == 'no Expr'){
            this.clearCanvas
            this.context.font = "30px Arial";
            this.context.fillText("No Expression to draw", 10, 50)
        }else if (Shape == 'ErrorGrp'){
            this.clearCanvas
            this.context.font = "10px Arial";
            this.context.fillText("Syntax Error. Pos length must be 2 times Forms() length", 10, 25)
        }else if (Shape == 'ErrorDrOf'){
            this.clearCanvas
            this.context.font = "10px Arial";
            this.context.fillText("Syntax Error. Offset is only use with Draw()", 10, 25)
        }else if (Shape == 'ErrorArg'){
            this.clearCanvas
            this.context.font = "10px Arial";
            this.context.fillText("Syntax Error. Group is declared with a list of Term in Forms() and their coordinates in Pos.", 10, 25)
        }else if (Shape == 'ErrorOs'){
            this.clearCanvas
            this.context.font = "10px Arial";
            this.context.fillText("Syntax Error. Offset must be declared with X and Y.", 10, 25)
        }else if (Shape == 'ErrorNaN'){
            
            this.context.font = "10px Arial";
            this.context.fillText("Syntax Error. X and Y must be number.", 10, 25)
        }else if (Shape == 'ErrorSh'){
            this.clearCanvas
            this.context.font = "10px Arial";
            this.context.fillText("Syntax Error. Shape must be declared with Form. Color is optional", 10, 25)
        }else if (Shape == 'ErrorDr'){
            this.clearCanvas
            this.context.font = "10px Arial";
            this.context.fillText("Syntax Error. Draw must be declared with 2 terms and 1 Offset term", 10, 25)
        }else if (Shape == 'ErrorOv'){
            this.clearCanvas
            this.context.font = "10px Arial";
            this.context.fillText("Syntax Error. over must be declared with 2 terms", 10, 25)
        }else if (Shape == 'ErrorUn'){
            this.clearCanvas
            this.context.font = "10px Arial";
            this.context.fillText("Syntax Error. Under must be declared with 2 terms", 10, 25)
        }else if (Shape == 'ErrorRi'){
            this.clearCanvas
            this.context.font = "10px Arial";
            this.context.fillText("Syntax Error. rightof must be declared with 2 terms", 10, 25)
        }else if (Shape == 'ErrorLe'){
            this.clearCanvas
            this.context.font = "10px Arial";
            this.context.fillText("Syntax Error. leftof must be declared with 2 terms", 10, 25)
        }else if (Shape == 'ErrorCo'){
            this.clearCanvas
            this.context.font = "10px Arial";
            this.context.fillText("Syntax Error. cons must be declared with 2 terms", 10, 25)
        }else if (Shape == 'empty'){
            this.context.font = "50px Arial";
            this.context.fillStyle ="black";
            this.context.fillText("[]", this.posX, this.posY+37)
        }else if (Shape == 'Square'){
            this.context.beginPath();
            this.context.rect(this.posX, this.posY, 50, 50);
        }else if (Shape == 'Circle'){
            this.context.beginPath()
            this.context.arc(this.posX+25, this.posY+25, 25, 0, 2 * Math.PI)
        } else if (Shape == 'Triangle'){
            this.context.beginPath();
            this.context.moveTo(this.posX, this.posY);
            this.context.lineTo(this.posX+50, this.posY);
            this.context.lineTo(this.posX, this.posY+50);
        }
    }

    // Give the colors to the canvas in which to draw
    public paint(Color: string) {
        if (Color == 'Blue'){
            this.context.fillStyle = "blue"
            this.context.fill();
        }else if(Color == 'Red') {
            this.context.fillStyle = "red"
            this.context.fill();
        }else if(Color == 'Black') {
            this.context.fillStyle = "black"
            this.context.fill();
        }else if(Color == 'Yellow') {
            this.context.fillStyle = "Yellow"
            this.context.fill();
        }else if(Color == 'Green') {
            this.context.fillStyle = "green"
            this.context.fill();
        }
    }

    constructor() {

        this.canvas = document.getElementById('myCanvas') as HTMLCanvasElement
        this.context = this.canvas.getContext("2d")
        this.posX = 5
        this.posY = 5

    }
}



export class Parser {

    // Class handling the terms and sending information to the class DrawingCanvas based on the label.
    // His main method is explore which read the label of a term and set the following instruction given the label. For now the function is called with the initialState and its different forms modified by Funblocks

    
    drawing = new DrawingCanvas();
    
    // This method works as a callback function. Given an Expr, it reads his label and works according to the semantic. For some label, it calls itself with the subterms to explore the entire term.

    public explore(Ex: AST.Expr){
        
    
        if (Ex == null){
            // handle the lauching with no Expr given
            this.drawing.draw('no Expr')
            this == null
        }else{
            let label = Ex.label

            // the different shapes possible

            if (label == 'Square'){
                this.drawing.draw(label)
            }
            if (label == 'Circle'){
                console.log(Ex.label)
                this.drawing.draw(label)
            }
            if (label == 'Triangle'){
                this.drawing.draw(label)
            }
            if (label == 'Blue'){
                this.drawing.paint(label)
            }
            if (label == 'Red'){
                this.drawing.paint(label)
            }
            if (label == 'Yellow'){
                this.drawing.paint(label)
            }
            if (label == 'Green'){
                this.drawing.paint(label)
            }
            // Handle the symbole [] for the end of a list
            if (label == 'Empty'){
                this.drawing.draw('empty')
                
            }

            // Handle the function Offset, Offset( X, Y), used in Draw function primarly. It only change the PosX or PosY given X and Y
            if (label == 'Offset'){
                let l = Ex.subterms.length
                let coord = Ex.subterms
                if (!(l==2)){
                    this.drawing.draw("ErrorOs")
                    
                }else if(isNaN(Number(coord[0].label)) || isNaN(Number(coord[1].label))){
                    this.drawing.draw("ErrorNaN")
                }else{
                    // convert label to number and suppress the -. the negative values are handled in the function Draw
                    this.drawing.X(Math.abs(Number(coord[0].label)))
                    this.drawing.Y(Math.abs(Number(coord[1].label)))
                }
            }

            
            // Handle the function Group, Group(Forms(Shape(...),...), Pos(X,Y,...)). 
            // Take the values X and Y (subterm i+1 and i+2) to place the Shape/term. 
            // Then replace the pencil at his place before the Shape/term.
            if (label == 'Group'){
                let Pos = Ex.subterms[1] as AST.Expr
                let Forms = Ex.subterms[0] as AST.Expr
                let Posl = Pos.subterms.length
                let Formsl = Forms.subterms.length
                
                let i = 0;
                if (!(Posl== 2*Formsl)){
                    this.drawing.draw("ErrorGrp")
                }else if (!(Forms.label == "Objects")||!(Pos.label == "Pos")){
                    this.drawing.draw("ErrorArgs")
                }else{
                    while(Formsl > i) {
                        
                        this.drawing.X(Number(Pos.subterms[2*i].label)-1)
                        this.drawing.Y(Number(Pos.subterms[2*i+1].label)-1)
                        this.explore(Forms.subterms[i] as AST.Expr)
                        this.drawing.X(- (Number(Pos.subterms[2*i].label)-1))
                        this.drawing.Y(- (Number(Pos.subterms[2*i+1].label)-1))
                        i += 1
                    }
                }
                
            }

            // Handle the function Draw, Draw( Expr, Expr, Offset(X,Y)). Expr can be a function or a Shape. As such we can create a lot of rafinated structure. 
            if (label == 'Draw'){
                let l = Ex.subterms.length
                if (!(l==3)){
                    this.drawing.draw("ErrorDr")
                }else{
                    let offset = Ex.subterms[2] as AST.Expr
                    // Here we handle the negative value present in the function Offset. It allows us to draw a term before another if you want to place them over or on the left. Graphicaly having an negativ Offset is the same as having a positiv Offset while interverting the two expressions.
                    if (Number(offset.subterms[0].label) > 0 || Number(offset.subterms[1].label) > 0){
                        this.explore(Ex.subterms[1] as AST.Expr)
                        this.explore(offset)
                        this.explore(Ex.subterms[0] as AST.Expr)
                    }else{
                    this.explore(Ex.subterms[0] as AST.Expr)
                    this.explore(offset)
                    this.explore(Ex.subterms[1] as AST.Expr)
                    }
                }
            }

            // Handle the Shape function, Shape(form, color:?). if color isn't given we have a black drawing
            if (label == 'Shape'){
                let l = Ex.subterms.length
                if (l == 1){
                    this.explore(Ex.subterms[0] as AST.Expr)
                    this.drawing.paint("Black")
                }else if(!(l==2)){
                    this.drawing.draw("ErrorSh")
                }else{
                    this.explore(Ex.subterms[0] as AST.Expr)
                    this.explore(Ex.subterms[1] as AST.Expr)
                }
            }

            // Handle the Cons function, Cons( Expr, Expr). Allows to work with list 
            if (label == 'Cons'){
                let l = Ex.subterms.length
                if (!(l==2)){
                    this.drawing.draw("ErrorCo")
                }else{
                    this.explore(Ex.subterms[0] as AST.Expr)
                    this.drawing.X()
                    this.explore(Ex.subterms[1] as AST.Expr)
                    this.drawing.X(-1)
                }
            }

            

            // Handle de function Over. Used to place an Expr over another
            if (label == 'Over'){
                let l = Ex.subterms.length
                if (!(l==2)){
                    this.drawing.draw("ErrorOv")
                }else{
                    this.explore(Ex.subterms[0] as AST.Expr)
                    this.drawing.Y()
                    this.explore(Ex.subterms[1] as AST.Expr)
                    this.drawing.Y(-1)
                }
            }

            // Handle de function Under. Used to place an Expr Under another
            if (label == 'Under'){
                let l = Ex.subterms.length
                if (!(l==2)){
                    this.drawing.draw("ErrorUn")
                }else{
                    this.explore(Ex.subterms[1] as AST.Expr)
                    this.drawing.Y()
                    this.explore(Ex.subterms[0] as AST.Expr)
                    this.drawing.Y(-1)
                }
            }

            // Handle de function RightOf. Used to place an Expr at the right of another
            if (label == 'RightOf'){
                let l = Ex.subterms.length
                if (!(l==2)){
                    this.drawing.draw("ErrorRi")
                }else{
                    this.explore(Ex.subterms[1] as AST.Expr)
                    this.drawing.X()
                    this.explore(Ex.subterms[0] as AST.Expr)
                    this.drawing.X(-1)
                }
            }

            // Handle de function LeftOf. Used to place an Expr at the left of another
            if (label == 'LeftOf'){
                let l = Ex.subterms.length
                if (!(l==2)){
                    this.drawing.draw("ErrorLe")
                }else{
                    this.explore(Ex.subterms[0] as AST.Expr)
                    this.drawing.X()
                    this.explore(Ex.subterms[1] as AST.Expr)
                    this.drawing.X(-1)
                }
            }
        }   
    }
}
