import * as AST from 'FunBlocks/AST'

export class DrawingCanvas {
 
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private posX: number
    private posY: number

    public clearCanvas(){
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height)
    }

    public Y(i?: number){
        if (i==-1){
            this.posY -= 55
        }else{
            if (this.posY + 55 < this.canvas.width) {
                this.posY += 55
            }else {
                this.canvas.width += 55
                this.posY += 55
            }
        }
    }

    public X(i?: number){
        if (i==-1){
            this.posX -= 55
        }else{
            if (this.posX + 55 < this.canvas.height) {
                this.posX += 55
            }else {
                this.canvas.height += 55
                this.posX += 55
            }
        }
    }

    public draw(Shape: string) {
        if (Shape == 'no Expr'){
            this.context.font = "30px Arial";
            this.context.fillText("No Expression to draw", 10, 50)
        }else if (Shape == 'empty'){
            this.context.font = "50px Arial";
            this.context.fillStyle ="black";
            this.context.fillText("[]", this.posX, this.posY+37)
        }else if (Shape == 'Carre'){
            this.context.beginPath();
            this.context.rect(this.posX, this.posY, 50, 50);
        }else if (Shape == 'Rond'){
            this.context.beginPath()
            this.context.arc(this.posX+25, this.posY+25, 25, 0, 2 * Math.PI)
        } else if (Shape == 'Triangle'){
            this.context.beginPath();
            this.context.moveTo(this.posX, this.posY);
            this.context.lineTo(this.posX+50, this.posY);
            this.context.lineTo(this.posX, this.posY+50);
        } else if (Shape == 'Coeur'){
            var ctx = new Path2D();

            ctx.bezierCurveTo(75, 37, 70, 25, 50, 25);
            ctx.bezierCurveTo(20, 25, 20, 62.5, 20, 62.5);
            ctx.bezierCurveTo(20, 80, 40, 102, 75, 120);
            ctx.bezierCurveTo(110, 102, 130, 80, 130, 62.5);
            ctx.bezierCurveTo(130, 62.5, 130, 25, 100, 25);
            ctx.bezierCurveTo(85, 25, 75, 37, 75, 40);
            ctx.moveTo(this.posX, this.posY);
            this.context.fill(ctx)
        }

        
    }
    public paint(Color: string) {
        if (Color == 'Bleu'){
            this.context.fillStyle = "blue"
            this.context.fill();
        }
        else if(Color == 'Rouge') {
            this.context.fillStyle = "red"
            this.context.fill();
        }else if(Color == 'Jaune') {
            this.context.fillStyle = "Yellow"
            this.context.fill();
        }else if(Color == 'Vert') {
            this.context.fillStyle = "green"
            this.context.fill();
        }else if (Color == 'Noir') {
            this.context.fillStyle = "black"
            this.context.fill();
        }
    }

    constructor() {
        let canvas = document.getElementById('myCanvas') as HTMLCanvasElement
        let context = canvas.getContext("2d")
        this.canvas = canvas
        this.context = context
        this.posX = 5
        this.posY = 5

    }
}



export class DrawnState {

    drawing = new DrawingCanvas();

    public explore(Ex: AST.Expr){
        console.log('branche : ', Ex)
        if (Ex == null){
            this.drawing.draw('no Expr')
        }else{
            console.log('branche : ', Ex.label)
            let label = Ex.label
            if (label == 'Carre'){
                this.drawing.draw(label)
            }
            if (label == 'Rond'){
                this.drawing.draw(label)
            }
            if (label == 'Triangle'){
                this.drawing.draw(label)
            }
            if (label == 'Bleu'){
                this.drawing.paint(label)
            }
            if (label == 'Rouge'){
                this.drawing.paint(label)
            }
            if (label == 'Jaune'){
                this.drawing.paint(label)
            }
            if (label == 'Vert'){
                this.drawing.paint(label)
            }
            
            if (label == 'Shape'){
                this.explore(Ex.subterms[0] as AST.Expr)
                this.explore(Ex.subterms[1] as AST.Expr)
            }
            if (label == 'over'){
                this.explore(Ex.subterms[0] as AST.Expr)
                this.drawing.Y()
                this.explore(Ex.subterms[1] as AST.Expr)
                this.drawing.Y(-1)
            }
            if (label == 'under'){
                this.explore(Ex.subterms[1] as AST.Expr)
                this.drawing.Y()
                this.explore(Ex.subterms[0] as AST.Expr)
                this.drawing.Y(-1)
            }

            if (label == 'rightof'){
                this.explore(Ex.subterms[1] as AST.Expr)
                this.drawing.X()
                this.explore(Ex.subterms[0] as AST.Expr)
                this.drawing.X(-1)
            }
            if (label == 'leftof'){
                this.explore(Ex.subterms[0] as AST.Expr)
                this.drawing.X()
                this.explore(Ex.subterms[1] as AST.Expr)
                this.drawing.X(-1)
            }
            if (label == 'cons'){
                this.explore(Ex.subterms[0] as AST.Expr)
                this.drawing.X()
                this.explore(Ex.subterms[1] as AST.Expr)
                
            }
            if (label == 'empty'){
                this.drawing.draw('empty')
                
            }
        }   
    }
}
