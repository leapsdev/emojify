import      React from     'react'

export const TestComponent = () => {
    const unusedVar = 'test';
    const items: any[] = ['a', 'b', 'c']

    return (
        <div>
            {items.map((item, index)=> {
                return <div key={index}>{item}</div>
            })}
        </div>
    )
}

const path = require('path')  // Node.jsモジュールをrequireで読み込み

console.log("test")  // console.logの使用
