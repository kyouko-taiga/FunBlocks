 import * as AST from 'FunBlocks/AST'
/*
/// The abstract base class for all terms.
abstract class Term {

  /// This term's label.
  public readonly label: string

  protected constructor(label: string) {

    this.label = label

  }

  _parent: Expr = null

  /// This term's parent, if any.
  public get parent(): Expr {
    return this._parent
  }

}

/// An expression.
class Expr extends Term {

    /// The subterms of this expression.
    public readonly subterms: Array<Term>

    public constructor(args: {
        label: string,
        subterms?: Term[],
      }) {
        super(args.label)
    
        this.subterms = args.subterms || []
        for (const subterm of this.subterms) {
          subterm._parent = this
        }
      }
}  
*/

class DrawingCanvas {
 
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private posX: number
    private posY: number

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
        if (Shape == 'Carre'){
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



class Main {

    public explore(Ex: AST.Expr){
        console.log('branche : ', Ex.label)
        let label = Ex.label
        if (label == 'Carre'){
            drawing.draw(label)
        }
        if (label == 'Rond'){
            drawing.draw(label)
        }
        if (label == 'Triangle'){
            drawing.draw(label)
        }
        if (label == 'Bleu'){
            drawing.paint(label)
        }
        if (label == 'Rouge'){
            drawing.paint(label)
        }
        if (label == 'Jaune'){
            drawing.paint(label)
        }
        if (label == 'Vert'){
            drawing.paint(label)
        }
        
        if (label == 'Shape'){
            this.explore(Ex.subterms[0] as AST.Expr)
            this.explore(Ex.subterms[1] as AST.Expr)
        }
        if (label == 'over'){
            this.explore(Ex.subterms[0] as AST.Expr)
            drawing.Y()
            this.explore(Ex.subterms[1] as AST.Expr)
            drawing.Y(-1)
        }
        if (label == 'under'){
            this.explore(Ex.subterms[1] as AST.Expr)
            drawing.Y()
            this.explore(Ex.subterms[0] as AST.Expr)
            drawing.Y(-1)
        }

        if (label == 'rightof'){
            this.explore(Ex.subterms[1] as AST.Expr)
            drawing.X()
            this.explore(Ex.subterms[0] as AST.Expr)
            drawing.X(-1)
        }
        if (label == 'leftof'){
            this.explore(Ex.subterms[0] as AST.Expr)
            drawing.X()
            this.explore(Ex.subterms[1] as AST.Expr)
            drawing.X(-1)
        }
        
    }
}




let couleur1 = new AST.Expr({label: 'Bleu'})
let couleur2 = new AST.Expr({label: 'Rouge'})
let couleur3 = new AST.Expr({label: 'Jaune'})
let couleur4 = new AST.Expr({label: 'Vert'})

let forme1 = new AST.Expr({label: 'Carre'})
let forme2 = new AST.Expr({label: 'Rond'})
let forme3 = new AST.Expr({label: 'Triangle'})

let Shape1 = new AST.Expr({label: 'Shape', subterms: [forme1, couleur1]})
let Shape2 = new AST.Expr({label: 'Shape', subterms: [forme2, couleur2]})
let Shape3 = new AST.Expr({label: 'Shape', subterms: [forme3, couleur3]})
let Shape4 = new AST.Expr({label: 'Shape', subterms: [forme1, couleur4]})

let func1 = new AST.Expr({label: 'leftof', subterms: [Shape1, Shape2]})
let func2 = new AST.Expr({label: 'leftof', subterms: [Shape3, Shape4]})

let Root = new AST.Expr({label: 'over', subterms: [func1, func2]})

let drawing = new DrawingCanvas();
let test = new Main
test.explore(Root)


