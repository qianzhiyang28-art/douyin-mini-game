export const BOARD = { width: 320, height: 256 };
export const SCENES = {
  fan: {title:'手拉小风扇',parts:[
    {id:'bottle',name:'瓶身',symbol:'bottle',rect:[90,64,105,183],target:[143,166,43],requires:[],tip:'先把瓶身放好，给转轴一个支撑。'},
    {id:'shaft',name:'转轴',symbol:'shaft',rect:[133,29,16,195],target:[141,121,32],requires:['bottle'],tip:'把木杆穿过瓶盖，让转轴能自由转动。'},
    {id:'rotor',name:'扇叶',symbol:'rotor',rect:[91,3,100,98],target:[141,52,37],requires:['shaft'],tip:'把扇叶装到转轴顶部。'},
    {id:'cord',name:'拉绳',symbol:'cord',rect:[143,130,136,82],target:[219,171,37],requires:['shaft','rotor'],tip:'接好拉绳，完成后就可以试着拉动了。'}
  ]},
  star: {title:'磁力悬浮星星',parts:[
    {id:'frame',name:'支架',symbol:'frame',rect:[50,14,220,232],target:[155,138,45],requires:[],tip:'先放好支架和底座。'},
    {id:'magnet',name:'上磁铁',symbol:'magnet',rect:[203,34,40,23],target:[223,45,29],requires:['frame'],tip:'把上方磁铁固定在横梁下面。'},
    {id:'paperstar',name:'星星',symbol:'paperstar',rect:[174,76,102,112],target:[225,132,37],requires:['magnet'],tip:'星星顶部也带一块磁铁，让两块磁铁互相吸引。'},
    {id:'tether',name:'细线',symbol:'tether',rect:[210,165,28,79],target:[224,211,30],requires:['paperstar'],tip:'把细线下端系到底座，限制星星的位置。'}
  ]}
};
export function boardPoint(clientX,clientY,rect){
  if(!rect||rect.width<=0||rect.height<=0)return null;
  return {x:(clientX-rect.left)/rect.width*BOARD.width,y:(clientY-rect.top)/rect.height*BOARD.height};
}
export function assessDrop(sceneId,partId,point,placed=new Set()){
  const scene=SCENES[sceneId],part=scene?.parts.find(p=>p.id===partId);
  if(!part||!point||!Number.isFinite(point.x)||!Number.isFinite(point.y))return {ok:false,reason:'invalid',message:'请重新拖起零件。'};
  if(placed.has(partId))return {ok:false,reason:'already',message:'这个零件已经装好了。'};
  const missing=part.requires.find(id=>!placed.has(id));
  if(missing){const name=scene.parts.find(p=>p.id===missing).name;return {ok:false,reason:'order',message:'先装好'+name+'，再放'+part.name+'。'};}
  const [x,y,r]=part.target;
  if(point.x<0||point.x>BOARD.width||point.y<0||point.y>BOARD.height||Math.hypot(point.x-x,point.y-y)>r)return {ok:false,reason:'position',message:'把'+part.name+'放到对应的虚线圈里。'};
  return {ok:true,reason:'placed',message:part.name+'装好了！'};
}
export function nextPart(sceneId,placed){return SCENES[sceneId].parts.find(p=>!placed.has(p.id))??null;}
