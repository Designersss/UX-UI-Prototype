(function(){
const L=(l,a,b)=>l==="en"?b:a;
function page(o,l,icon,id){
 const steps=[
 [L(l,"Дайте имя","Name your agent"),L(l,"Назовите агента понятно для команды и кратко опишите его задачу.","Give your teammate a descriptive name and purpose.")],
 [L(l,"Выберите профессию","Choose a profession"),L(l,"Профессия задаёт направление и отправные настройки. Позже всё можно изменить.","The role defines initial settings that you can customize.")],
 [L(l,"Настройте поведение","Configure behavior"),L(l,"Укажите, что агент должен делать, что ему известно и когда передавать вопросы человеку.","Describe what the agent does, what it knows and when to hand off.")],
 [L(l,"Выберите знания и интеграции","Choose knowledge and integrations"),L(l,"В отдельном каталоге выберите материалы и доступные подключения.","Use the picker to choose materials and connected services.")],
 [L(l,"Проверьте доступ","Review access"),L(l,"Определите группу управления и команду, которой передаются сложные вопросы.","Choose which team manages the agent and receives handoffs.")],
 [L(l,"Создайте агента","Create the agent"),L(l,"Нажмите «Создать агента». Он появится в каталоге выключенным. Запуск и тестирование доступны из карточки.","Press Create. The agent stays off until you choose to enable or test it from its detail page.")]
 ];
 return '<header class="ag-head"><a href="#/agents/'+id+'/edit">← '+L(l,"К созданию агента","Back to editor")+'</a><h1>'+L(l,"Как создать агента","How to create an agent")+'</h1><p>'+L(l,"Шесть простых шагов — от названия до первого включения.","Six practical steps, from naming to activation.")+'</p></header><section class="ag-guide">'+steps.map((x,i)=>'<div class="ag-step"><span>'+(i+1)+'</span><div><h2>'+x[0]+'</h2><p>'+x[1]+'</p></div></div>').join("")+'</section><a class="ag-back" href="#/agents/'+id+'/edit">'+L(l,"Вернуться к настройке","Return to setup")+' →</a>';
}
globalThis.AIMockAgentGuide={page};
})();