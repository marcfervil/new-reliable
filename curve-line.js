
/* 
 * Interactive SVG+Javascript demo that computes intersections 
 * between a cubic bezier curve and a linear segment.
 *
 * For more info see:
 * http://www.particleincell.com/blog/2013/cubic-line-intersection/ 
 *
 * You may freely use this algorithm in your codes however where feasible
 * please include a link/reference to the source article
 */ 

var svg=document.documentElement /*svg object*/
var S=new Array() /*splines*/
var P=new Array() /*control points*/
var I=new Array() /*intersection points*/
var O 	/*current object*/
var x0,y0	/*svg offset*/

/*saves elements as global variables*/
function init()
{
    /*create linear segment*/
    S[0] = createPath("blue");
    
	/*create splines*/
	S[1] = createPath("red");
	
	/*create control points for the cubic*/
	P[0] = createMarkerV(60,400,"blue");
	P[1] = createMarkerK(150,80);
	P[2] = createMarkerK(500,400);
	P[3] = createMarkerV(700,200,"blue");
    
    /*create control points for the line*/
    P[4] = createMarkerV(300,50,"red");
	P[5] = createMarkerV(400,450,"red");
	
    /*create point to mark intersection*/
    I[0] = createMarkerI(300,300);
    I[1] = createMarkerI(300,300);
    I[2] = createMarkerI(300,300);
    
	updateSplines();
}

/*creates and adds an SVG circle to represent vertices*/
function createMarkerV(x,y,fill)
{
	var C=document.createElementNS("http://www.w3.org/2000/svg","circle")
	C.setAttributeNS(null,"r",20)
	C.setAttributeNS(null,"cx",x)
	C.setAttributeNS(null,"cy",y)
    C.setAttributeNS(null,"style","cursor:pointer")
	C.setAttributeNS(null,"fill",fill)
	C.setAttributeNS(null,"stroke","black")
	C.setAttributeNS(null,"stroke-width","4")
	C.setAttributeNS(null,"onmousedown","startMove(evt)")
	svg.appendChild(C)	
	return C
}

/*creates and adds an SVG circle to represent knots*/
function createMarkerK(x,y)
{
	var C=document.createElementNS("http://www.w3.org/2000/svg","circle")
	C.setAttributeNS(null,"r",16)
	C.setAttributeNS(null,"cx",x)
	C.setAttributeNS(null,"cy",y)
	C.setAttributeNS(null,"style","cursor:pointer")
	C.setAttributeNS(null,"fill","white")
	C.setAttributeNS(null,"stroke","black")
	C.setAttributeNS(null,"stroke-width","4")
	C.setAttributeNS(null,"onmousedown","startMove(evt)")
    svg.appendChild(C)	
	return C
}

/*creates and adds an SVG circle to represent intersection*/
function createMarkerI(x,y)
{
	var C=document.createElementNS("http://www.w3.org/2000/svg","circle")
	C.setAttributeNS(null,"r",10)
	C.setAttributeNS(null,"cx",x)
	C.setAttributeNS(null,"cy",y)
	C.setAttributeNS(null,"fill","black")
	svg.appendChild(C)	
	return C
}

/*creates and adds an SVG path without defining the nodes*/
function createPath(color,width)
{		
	width = (typeof width == 'undefined' ? "8" : width);
	var P=document.createElementNS("http://www.w3.org/2000/svg","path")
	P.setAttributeNS(null,"fill","none")
	P.setAttributeNS(null,"stroke",color)
	P.setAttributeNS(null,"stroke-width",width)
	svg.appendChild(P)
	return P
}

/*from http://www.w3.org/Graphics/SVG/IG/resources/svgprimer.html*/
function startMove(evt)
{
	/*SVG positions are relative to the element but mouse 
	  positions are relative to the window, get offset*/
	x0 = getOffset(svg).left; 
	y0 = getOffset(svg).top; 
	
	O=evt.target
	svg.setAttribute("onmousemove","move(evt)")
	svg.setAttribute("onmouseup","drop()")	
}

/*called on mouse move, updates dragged circle and recomputes splines*/
function move(evt)
{
	x = evt.clientX-x0;
	y = evt.clientY-y0;
	
	/*move the current handle*/
	O.setAttributeNS(null,"cx",x)
	O.setAttributeNS(null,"cy",y)
	updateSplines();
}

/*called on mouse up event*/
function drop()
{
	svg  = document.getElementsByTagName('svg')[0];
	svg.setAttributeNS(null, "onmousemove",null)
}
	
/*computes spline control points*/
function updateSplines()
{	
	/*grab (x,y) coordinates of the control points*/
	var px=new Array();
	var py=new Array();
	for (i=0;i<4;i++)
	{
		/*use parseInt to convert string to int*/
		px[i]=parseInt(P[i].getAttributeNS(null,"cx"))
		py[i]=parseInt(P[i].getAttributeNS(null,"cy"))
	}
    
    var lx=new Array();
	var ly=new Array();
	for (i=0;i<2;i++)
	{
		/*use parseInt to convert string to int*/
		lx[i]=parseInt(P[i+4].getAttributeNS(null,"cx"))
		ly[i]=parseInt(P[i+4].getAttributeNS(null,"cy"))
	}
  
	/*updates path settings, the browser will draw the new spline*/
    S[0].setAttributeNS(null,"d",pathCubic(px,py));
    S[1].setAttributeNS(null,"d",pathLine(lx,ly));
    
    /*compute intersection points and move dots*/
    computeIntersections(px,py,lx,ly);    
}

/*computes intersection between a cubic spline and a line segment*/
function computeIntersections(px,py,lx,ly)
{

    console.log("px ", px, " py ",py," lx ", lx," ly ", ly)

    var X=Array();
    
    var A=ly[1]-ly[0];	    //A=y2-y1
	var B=lx[0]-lx[1];	    //B=x1-x2
	var C=lx[0]*(ly[0]-ly[1]) + 
          ly[0]*(lx[1]-lx[0]);	//C=x1*(y1-y2)+y1*(x2-x1)

	var bx = bezierCoeffs(px[0],px[1],px[2],px[3]);
	var by = bezierCoeffs(py[0],py[1],py[2],py[3]);
	
    var P = Array();
	P[0] = A*bx[0]+B*by[0];		/*t^3*/
	P[1] = A*bx[1]+B*by[1];		/*t^2*/
	P[2] = A*bx[2]+B*by[2];		/*t*/
	P[3] = A*bx[3]+B*by[3] + C;	/*1*/
	
	var r=cubicRoots(P);
	
    /*verify the roots are in bounds of the linear segment*/
    for (var i=0;i<3;i++)
    {
        t=r[i];
        
        X[0]=bx[0]*t*t*t+bx[1]*t*t+bx[2]*t+bx[3];
        X[1]=by[0]*t*t*t+by[1]*t*t+by[2]*t+by[3];            
            
        /*above is intersection point assuming infinitely long line segment,
          make sure we are also in bounds of the line*/
        var s;
        if ((lx[1]-lx[0])!=0)           /*if not vertical line*/
            s=(X[0]-lx[0])/(lx[1]-lx[0]);
        else
            s=(X[1]-ly[0])/(ly[1]-ly[0]);
        
        /*in bounds?*/    
        if (t<0 || t>1.0 || s<0 || s>1.0)
        {
            X[0]=-100;  /*move off screen*/
            X[1]=-100;
        }
        
        /*move intersection point*/
        //console.log("point " ,X[0], "Point 2", X[1])
        I[i].setAttributeNS(null,"cx",X[0]);
        I[i].setAttributeNS(null,"cy",X[1]);
    }
    
}

/*based on http://mysite.verizon.net/res148h4j/javascript/script_exact_cubic.html#the%20source%20code*/
function cubicRoots(P)
{
	var a=P[0];
	var b=P[1];
	var c=P[2];
	var d=P[3];
	
	var A=b/a;
	var B=c/a;
	var C=d/a;

    var Q, R, D, S, T, Im;

    var Q = (3*B - Math.pow(A, 2))/9;
    var R = (9*A*B - 27*C - 2*Math.pow(A, 3))/54;
    var D = Math.pow(Q, 3) + Math.pow(R, 2);    // polynomial discriminant

    var t=Array();
	
    if (D >= 0)                                 // complex or duplicate roots
    {
        var S = sgn(R + Math.sqrt(D))*Math.pow(Math.abs(R + Math.sqrt(D)),(1/3));
        var T = sgn(R - Math.sqrt(D))*Math.pow(Math.abs(R - Math.sqrt(D)),(1/3));


        t[0] = -A/3 + (S + T);                    // real root
        t[1] = -A/3 - (S + T)/2;                  // real part of complex root
        t[2] = -A/3 - (S + T)/2;                  // real part of complex root
        Im = Math.abs(Math.sqrt(3)*(S - T)/2);    // complex part of root pair   
        
        /*discard complex roots*/
        if (Im!=0)
        {
            t[1]=-1;
            t[2]=-1;
        }
    
    }
    else                                          // distinct real roots
    {
        var th = Math.acos(R/Math.sqrt(-Math.pow(Q, 3)));
        
        t[0] = 2*Math.sqrt(-Q)*Math.cos(th/3) - A/3;
        t[1] = 2*Math.sqrt(-Q)*Math.cos((th + 2*Math.PI)/3) - A/3;
        t[2] = 2*Math.sqrt(-Q)*Math.cos((th + 4*Math.PI)/3) - A/3;
        Im = 0.0;
    }
    
    /*discard out of spec roots*/
	for (var i=0;i<3;i++) 
        if (t[i]<0 || t[i]>1.0) t[i]=-1;
                
	/*sort but place -1 at the end*/
    t=sortSpecial(t);
    
	//console.log(t[0]+" "+t[1]+" "+t[2]);
    return t;
}

function sortSpecial(a)
{
    var flip;
    var temp;
    
    do {
        flip=false;
        for (var i=0;i<a.length-1;i++)
        {
            if ((a[i+1]>=0 && a[i]>a[i+1]) ||
                (a[i]<0 && a[i+1]>=0))
            {
                flip=true;
                temp=a[i];
                a[i]=a[i+1];
                a[i+1]=temp;
                
            }
        }
    } while (flip);
	return a;
}

// sign of number
function sgn( x )
{
    if (x < 0.0) return -1;
    return 1;
}

function bezierCoeffs(P0,P1,P2,P3)
{
	var Z = Array();
	Z[0] = -P0 + 3*P1 + -3*P2 + P3; 
    Z[1] = 3*P0 - 6*P1 + 3*P2;
    Z[2] = -3*P0 + 3*P1;
    Z[3] = P0;
	return Z;
}
    
/*creates formated path string for SVG cubic path element*/
function pathCubic(x,y)
{
	return "M "+x[0]+" "+y[0]+" C "+x[1]+" "+y[1]+" "+x[2]+" "+y[2]+" "+x[3]+" "+y[3];
}

/*creates formated path string for SVG cubic path element*/
function pathLine(x,y)
{
	return "M "+x[0]+" "+y[0]+" L "+x[1]+" "+y[1];
}

/*code from http://stackoverflow.com/questions/442404/dynamically-retrieve-html-element-x-y-position-with-javascript*/
function getOffset( el ) 
{
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}
