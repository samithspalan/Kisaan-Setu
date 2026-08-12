import jwt from 'jsonwebtoken';
const Token=(id, role)=>{
    const token=jwt.sign({id, role},process.env.JWT_SECRET,{
        expiresIn: "7d"
    });
    return token;
}
export default Token