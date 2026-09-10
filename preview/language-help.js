/* Keep useful school words, with plain explanations beside the activity. */
const wordHelp={
 fractions:'A fraction shows equal parts of a whole. Equal parts are the same size. Equivalent fractions show the same amount. A decimal is another way to write a number, such as 0.5 for one half.',
 numberline:'A mixed number has a whole number and a fraction, like 1½. A number line shows numbers in order, with equal spaces between equal steps.',
 area:'Area is the space inside a shape. A square unit is one small square used to measure that space. One square centimetre is written 1 cm².',
 perimeter:'Perimeter is the distance all the way around the outside of a shape. Add the lengths of all its sides.',
 facts:'Multiply means count equal groups. Divide means split into equal groups. These two actions can help you check each other.',
 numbers:'Place value tells you what a digit is worth. In 0.25, the 2 means two tenths and the 5 means five hundredths.',
 problems:'An estimate is a sensible guess based on numbers. Rounding means using a nearby number that is easier to work with.',
 patterns:'A pattern follows a rule. A missing value is a number you need to find.',
 measure:'Duration means how long something lasts. There are 60 minutes in one hour. A scale is a set of marks used to measure something.',
 space:'A right angle is a square corner. An acute angle is smaller. An obtuse angle is wider but less than a straight line. Symmetry means parts of a shape match when you fold or turn it.',
 data:'Data means the facts or answers you collect. A graph shows them in a picture. A key tells you what each mark or symbol means.',
 chance:'Likely means it has a good chance of happening. Independent events do not change each other’s chances, like separate coin tosses.',
 parts:'A prefix is a word part added at the start, like un- in unhappy. A suffix goes at the end, like -ful in helpful.',
 homophones:'Homophones sound the same but have different meanings or spellings, like hear and here. The sentence helps you choose.',
 sentences:'A verb is an action or being word, like run or is. Tense shows when something happens. Speech marks (“ ”) show words someone says.',
 reading:'To infer means to use clues to work something out. Suspense is the feeling of waiting to find out what happens next.'
};
const languageQuestion=question;
question=function(){languageQuestion();const item=session?.deck?.[session.index];const help=wordHelp[item?.topic||session?.topic?.id];const panel=document.querySelector('.question');if(panel&&help)panel.insertAdjacentHTML('beforeend',`<details class="word-help"><summary>What do these words mean?</summary><p>${esc(help)}</p></details>`)};
