const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

export function parseBatchDate(dateStr)
{
    if(!dateStr)
    {
        return null
    }
    let [day,month,year]=dateStr.split("-").map(Number)
    if(!day || !month || !year)
    {
        return null
    }
    return new Date(year,month-1,day)
}

export function isBatchUpcoming(dateStr)
{
    let date=parseBatchDate(dateStr)
    if(!date)
    {
        return false
    }
    let today=new Date()
    today.setHours(0,0,0,0)
    return date.getTime()>=today.getTime()
}

export function formatBatchDateShort(dateStr)
{
    let date=parseBatchDate(dateStr)
    if(!date)
    {
        return ""
    }
    return `${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`
}

export function getNextBatchForCourse(courseName,batches)
{
    let upcoming=batches
        .filter((batch)=>batch.name===courseName && isBatchUpcoming(batch.date))
        .sort((a,b)=>parseBatchDate(a.date)-parseBatchDate(b.date))
    return upcoming[0] || null
}
