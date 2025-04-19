
 const asynchandler=(requesthandler)=>{
    return (req,res,next)=>{
        requesthandler(req,res,next).catch(next);
    }


 }

 export {asynchandler}