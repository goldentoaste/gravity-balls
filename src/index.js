import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { InputAdornment } from '@mui/material';

class Vector2 {


    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static get zero() {
        return new Vector2(0, 0);
    }

    static r2d(rad) {
        //converts radian into degrees
        return 360 * rad / (2 * Math.PI);
    }

    static d2r(deg) {
        return (deg / 360) * 2 * Math.PI;
    }

    rotated(angle) {
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
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    angle() {
        //returns angle relative to x-axis in radians
        return Math.atan2(this.y, this.x);
    }

    dot(v2) {
        //returns the dot product of the 2 vectors, does not change either.
        return (this.x * v2.x) + (this.y * v2.y);
    }

    add(vec) {
        //adds another vector onto this one, and return result

        return new Vector2(this.x + vec.x, this.y + vec.y);
    }

    mul(float) {
        //mutipleis this vector with a float, and returns result

        return new Vector2(float * this.x, float * this.y);
    }

    distTo(vec) {

        return vec.add(this.mul(-1)).mag();
    }

    normalized() {
        let mag = this.mag()
        if (mag === 0) {
            return Vector2.zero;
        }
        return new Vector2(this.x / mag, this.y / mag);
    }

    toString() {
        return `Vector2 (${this.x} , ${this.y})`
    }
}


const G = 6.674e-12; //universal gravitational constant
const updatesPerSec = 60;
const deltaTime = 1 / updatesPerSec;
const multiplier = 1;
class GravityBall {
    constructor(position = Vector2.zero(), velocity = Vector2.zero(), mass = 0.0, radius = 0.0, color = "#304050", name = "wow!", nameColor = "#efe0e2") {
        /*
        postion : Vector2, initial postition of this ball
        velocity : Vector2, initial velocity of this ball, in m/s
        mass: float, mass of this ball, in kg
        radius: float, radius of this ball, in m
        */

        this.position = position;
        this.velocity = velocity;
        this.mass = mass;
        this.radius = radius;
        this.color = color;
        this.name = name;
        this.nameColor = nameColor;
    }

    get x() {
        return this.position.x;
    }

    get y() {
        return this.position.y;
    }

    get deltaX() {
        return this.velocity.x;
    }

    get deltaY() {
        return this.velocity.y;
    }



    applyImpulse(force = Vector2.zero(), dt = 0.0) {
        /*
        impulse/change in momentum = F * dt = M * A * dt
        => change in velocity = F * dt / mass
        force: Vector2, in kg*m/s^2
        dt: float, change in time
        */

        this.velocity = this.velocity.add(force.mul(multiplier * dt / this.mass));
        // print(this.velocity)
    }

    applyAttraction(b2) {
        /*
            applying newton's gravitation formula:
    
            F = G * (m1 * m2) * dir / r^2 
            where dir is the normalized vector/direction from b1 to b2, thus F is a force vector
            b1 attracts b2 by F, b2 attacts b1 by -F
    
            note this function applies force to both objects to save a tiny bit of computation, so only 1 call is needed.
        */

        let dir = b2.position.add(this.position.mul(-1)).normalized(); //unit vector for direction

        let distance = this.position.distTo(b2.position);
        let F = dir.mul(G * this.mass * b2.mass / (distance ** 2));
        this.applyImpulse(F, deltaTime);
        b2.applyImpulse(F.mul(-1), deltaTime);
    }

    updatePos() {
        this.position = this.position.add(this.velocity);
    }

    draw(ctx) {

        ctx.fillStyle = this.color;
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
        ctx.fill()
    }



}



/*
https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
yoink!
*/

const Canvas = ({ objs, updateCallback, props }) => {
    const canvasRef = useRef(null); //null as initial val
    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d');


        let interval = setInterval(() => {
            updateCallback();
            context.clearRect(0, 0, context.canvas.width, context.canvas.height)
            for (let item of objs) {
                item.draw(context);
            }
        }, deltaTime * 1000);

        return () => clearInterval(interval);
    }, []) //initialize canvas on initial render
    return (
        <canvas ref={canvasRef} {...props} />
    );
}

const AddObjDialog = ({ onFinish }) => {
    const [open, setOpen] = useState(false);

    const posRef = useRef(null);
    const velRef = useRef(null);
    const massRef = useRef(null);
    const radiusRef = useRef(null);
    const nameRef = useRef(null);
    const nameColorRef = useRef(null);
    const colorRef = useRef(null);

    const [posValid, setPosValid] = useState(false);
    const [velValid, setVelValid] = useState(false);


    return (
        <div>
            <Button variant="outlined" onClick={() => { setOpen(true) }}>
                Add Ball
            </Button>
            {/* do on finish values */}
            <Dialog open={open} onClose={() => { setOpen("false") }}
            >
                <DialogTitle>Add a new gravity ball!</DialogTitle>
                <DialogContent>
                    Add a new gravity ball, with initial position and velocity, mass, radius(visual only, interact as if radius is 0). Color, name, name color are optional.
                    Also, coordinate starts with 0,0 at upper left corner, positive X is right, positive Y is down.

                    <TextField
                        inputRef={posRef}
                        variant="outlined"
                        margin='normal'
                        label="ini position"
                        fullWidth
                        defaultValue="(200 , 200)"
                        onChange={(e) => {
                            let newVal = e.target.value.replace(/{[^1-9,.]}/, "");
                            e.target.value = newVal;
                            setPosValid(newVal.split(",").every((val) => !isNaN(val)));
                        }}
                        error={posValid}
                    />
                    <TextField
                        inputRef={velRef}
                        variant="outlined"
                        margin='normal'
                        fullWidth
                        label="ini velocity"
                        defaultValue="(0 , 0)"
                        onChange={(e) => {
                            let newVal = e.target.value.replace(/{[^1-9,.]}/, "");
                            e.target.value = newVal;
                            setVelValid(newVal.split(",").every((val) => !isNaN(val)));
                        }}
                        error={velValid}
                    />
                    <TextField
                        inputRef={massRef}
                        type="number"
                        margin='normal'
                        variant="outlined"
                        label="mass"
                        defaultValue={10000000000000}
                        InputProps={
                            {
                                endAdornment: <InputAdornment position='end'>kg</InputAdornment>,
                            }
                        }
                    />
                    <TextField
                        inputRef={radiusRef}
                        type="number"
                        margin='normal'
                        variant="outlined"
                        label="radius"
                        defaultValue={10}
                        InputProps={
                            {
                                endAdornment: <InputAdornment position='end'>km</InputAdornment>,
                            }
                        }
                    />

                    <TextField
                        inputRef={nameRef}
                        margin='normal'
                        variant="outlined"
                        label="name"
                        fullWidth
                        defaultValue={"gravity ball!"}
                    />
                    <TextField

                        inputRef={colorRef}
                        margin='normal'
                        variant="outlined"
                        label="color"
                        defaultValue={"#304050"}
                    />
                    <TextField
                        inputRef={nameColorRef}
                        defaultValue={"#efe0e2"}
                        margin='normal'
                        variant="outlined"
                        label="name color"
                    />
                </DialogContent>
                <DialogActions>

                    <Button 
                    onClick={() => {
                        setOpen(false);
                        onFinish(
                            posRef.current.value,
                            velRef.current.value,
                            massRef.current.value,
                            radiusRef.current.value,
                            colorRef.current.value,
                            nameRef.current.value,
                            nameColorRef.current.value
                        );
                    }}>
                        Add!
                    </Button>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </div>
    );

}

const print = (item) => {
    console.log(item)
}

const Parent = () => {
    let stuff = [
        new GravityBall(new Vector2(500, 400), new Vector2(0, 2), 8000000000000000, 30),
        // new GravityBall(new Vector2(700, 400), new Vector2(0, -2), 8000000000000000, 30),
        new GravityBall(new Vector2(1000, 400), new Vector2(0, 3.2), 10000000000000, 4),
        new GravityBall(new Vector2(300, 400), new Vector2(0, -3.5), 90000000000000, 9),
        new GravityBall(new Vector2(600, 800), new Vector2(3, 0.4), 9000000000000, 15),

    ]
    const update = () => {
        let o = {};
        for (let item1 of stuff) {
            for (let item2 of stuff) {

                if ((!(o[item1] === item2) || !(o[item2] === item1)) && item1 !== item2) {
                    item1.applyAttraction(item2);
                    o[item1] = item2;
                    o[item2] = item1;
                }
            }
        }
        for (let item of stuff) {
            item.updatePos();
        }
    }

    const strToVec = (str)=> new Vector2(...(str.replace(/[^0-9,.]/g, "").split(",").map((item)=>parseFloat(item))
    ))
    const makeBall = (posRef, velRef, massRef, radiusRef, colorRef, nameRef, nameColorRef) => {
        //.map((item)=>parseFloat(item))
        
        stuff.push(new GravityBall(strToVec(posRef),strToVec( velRef), parseFloat(massRef), parseFloat(radiusRef), colorRef, nameRef, nameColorRef));
        print(stuff)
    }
    return (
        <div className="container">
            <div className="menuGroup">
                <div className="buttonGroup">
                    <Button variant="outlined" onClick={() => {
                        stuff.length = 0;
                    }}>Clear</Button>
                    <AddObjDialog onFinish={makeBall} />

                </div>
            </div>
            <div className="canvas">
                <Canvas objs={stuff} updateCallback={update} props={{ height: 2000, width: 2000 }} />
            </div>
        </div>
    );
};





// ========================================

ReactDOM.render(
    <Parent />,
    document.getElementById('root')
);
