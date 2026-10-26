// Shared by the offline browser bundle and Node geometry tests; pixels throughout.
function overlap(a,b,gap=8){return a.x<b.x+b.width+gap&&a.x+a.width+gap>b.x&&a.y<b.y+b.height+gap&&a.y+a.height+gap>b.y;}
function layoutNotes(points,width,height,protectedAreas=[],controls=[]){
 if(width<620)return null;
 const markers=points.map(p=>({x:p.x-25,y:p.y-25,width:50,height:50}));
 const choices=points.map(p=>{
  const candidates=[{x:p.x+40,y:p.y-p.height/2},{x:p.x-p.width-40,y:p.y-p.height/2}];
  for(let y=12;y+p.height<=height-12;y+=16)for(let x=12;x+p.width<=width-12;x+=20)candidates.push({x,y});
  return candidates.map(c=>({...p,...c})).filter(b=>b.x>=12&&b.y>=12&&b.x+b.width<=width-12&&b.y+b.height<=height-12&&[...protectedAreas,...controls,...markers].every(a=>!overlap(a,b,8))).sort((a,b)=>Math.hypot(a.x+a.width/2-p.x,a.y+a.height/2-p.y)-Math.hypot(b.x+b.width/2-p.x,b.y+b.height/2-p.y)).filter((b,i,list)=>list.slice(0,i).every(a=>Math.hypot(a.x-b.x,a.y-b.y)>24)).slice(0,80);
 });
 const result=[];let attempts=0;
 function search(i){if(i===choices.length)return true;if(++attempts>4000)return false;for(const b of choices[i]){if(result.some(a=>overlap(a,b,10)))continue;result.push(b);if(search(i+1))return true;result.pop();}return false;}
 return search(0)?result:null;
}
function layoutNodes(rows,width,height,controls=[]){
 const placed=[];
 for(const row of rows){
  const candidates=[{x:row.x,y:row.y}];
  for(let r=50;r<=Math.hypot(width,height);r+=26)for(let a=0;a<Math.PI*2;a+=Math.PI/12)candidates.push({x:row.x+r*Math.cos(a),y:row.y+r*Math.sin(a)});
  for(let y=50;y<=height-26;y+=50)for(let x=26;x<=width-26;x+=50)candidates.push({x,y});
  const p=candidates.find(p=>p.x>=24&&p.y>=48&&p.x<=width-24&&p.y<=height-24&&placed.every(a=>Math.hypot(a.x-p.x,a.y-p.y)>=48)&&controls.every(c=>!overlap({x:p.x-22,y:p.y-22,width:44,height:44},c,6)));
  if(p)placed.push({...row,anchorX:row.x,anchorY:row.y,...p});
 }
 return placed;
}
if(typeof module!=='undefined')module.exports={overlap,layoutNotes,layoutNodes};
