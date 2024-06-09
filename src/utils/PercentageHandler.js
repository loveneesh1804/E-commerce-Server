const percentageHandler = (thisMonth,lastMonth)=>{
    if(lastMonth===0) return thisMonth * 100;
    const percentage = (thisMonth / lastMonth) * 100;
    return Number(percentage.toFixed(0));
}

module.exports = percentageHandler;