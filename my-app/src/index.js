import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './index.css';


class Vector2{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    static zero(){
        return new Vector2(0,0);
    }

    static r2d(rad){
        //converts radian into degrees
        return 360 * rad / (2*Math.PI);
    }

    static d2r(deg){
        return (deg/360) * 2 * Math.PI;
    }

    rotated(angle){
        //rotates this vector by angle in radians, then return the rotated vector.

        let cos = Math.cos(angle);
        let sin = Math.sin(angle)

        let x = this.x;
        let y = this.y;

        this.x = x * cos - y * sin;
        this.y = x * sin + y * cos;

        return this;
    }

    mag() {
        return Math.sqrt(this.x**2 + this.y**2);
    }

    angle(){
        //returns angle relative to x-axis in radians
        return Math.atan2(this.y, this.x);
    }

    dot(v2){
        //returns the dot product of the 2 vectors, does not change either.
        return (this.x * v2.x) + (this.y * v2.y);
    }

    add(vec){
        //adds another vector onto this one, and return result
        this.x += vec.x;
        this.y += vec.y;
        return this;
    }

    mul(float){
        //mutipleis this vector with a float, and returns result
        this.x *= float
        this.y *= float
        return this;
    }

    distTo(vec){
        return vec.add(this.mul(-1)).mag();
    }

    normalized(){
        let mag = this.mag()
        return new Vector2(this.x / mag, this.y / mag);
    }

    toString(){
        return `Vector2 (${this.x} , ${this.y})`
    }
}

// class GravityBall {
//     constructor(x, y, )
// }



/*
https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
yoink!
*/

const Canvas = (props) => {
    const canvasRef = useRef(null); //null as initial val

    

    const update = (ctx , frame) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height) //reset

        ctx.fillStyle = '#000'
        ctx.beginPath()
        ctx.arc(50, 100, 20 * Math.abs(Math.sin(frame * 0.05)), 0, 2 * Math.PI)
        ctx.fill()
    }



    useEffect(()=>{
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')


        let frame = 0
        let animationFrameid
        const render = () => {
            frame ++
            update(context, frame)
            animationFrameid = window.requestAnimationFrame(render)
        }

        render()
        return () => {
            window.cancelAnimationFrame(animationFrameid)
        }
    }, [update]) //initialize canvas on initial render

    return (
        <canvas ref = {canvasRef} {...props}/>
    );
}



const Parent = () => {

     return (
        <div className="container">
            <div className="menuGroup">
            
            </div>
            <div className="canvas">
                <Canvas/>
            </div>
        </div>
    );
};





// ========================================

ReactDOM.render(
    <Parent />,
    document.getElementById('root')
);
