export const freckleStyles=[
 {name:'日晒横带',en:'Sun-kissed band'},
 {name:'双颊轻点',en:'Soft cheek clusters'},
 {name:'鼻梁细点',en:'Nose bridge dusting'},
 {name:'自然散落',en:'Natural scatter'},
];
export function frecklePoints(pattern=0){
 const count=[48,40,30,66][Math.max(0,Math.min(3,pattern))];
 return Array.from({length:count},(_,k)=>{
  const a=((k*37+11)%101)/101,b=((k*23+7)%71)/71;
  let u=.08+a*.84,v=.2+b*.6;
  if(pattern===1){u=k%2?.7+a*.23:.07+a*.23;v=.22+b*.65;}
  if(pattern===2){u=.37+a*.26;v=.13+b*.58;}
  if(pattern===3){u=.03+a*.94;v=.05+b*.9;}
  return {u,v,size:.0017+(k%4)*.00045,weight:k%3===0?.7:1};
 });
}
