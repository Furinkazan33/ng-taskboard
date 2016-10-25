<div id="{{task._id}}" draggable class="panel panel-default card lighten-3" ng-class="{active: task.g_context.active}" style="height: {{task.g_context.visible ? task.g_context.height : data.g_context.task.hiddenHeight}}px; width: {{data.g_context.task.width}}px; position: relative; left: {{task.g_context.left}}px; top: {{task.g_context.top}}px;">
  <div class="panel-heading card-action lighten-2" style="background-color: {{task.g_context.colors.color1}}; color: {{task.g_context.colors.color3}}">
    <div class="panel-title" ng-model="task.title">{{task.title}}</div>
    <div class="toolbar">
      <i class="restore tiny material-icons" ng-click="restoreTask(task._id)" ng-hide="{{task.g_context.active}}">restore</i>
      <i class="save tiny material-icons" ng-click="saveTask(task)">save</i>
      <i class="toggle tiny material-icons" ng-click="toggleTask(task._id)">call_received</i>
      <i class="delete tiny material-icons" ng-click="deleteTask(task._id)">delete</i>
    </div>
  </div>
  <div class="panel-body card-content" style="background-color: {{task.g_context.colors.color2}}" ng-show="task.g_context.visible" ng-hide="!task.g_context.visible">
    <textarea class="text" style="background-color: {{task.g_context.colors.color2}}; color: {{task.g_context.colors.color3}}" ng-model="task.text">{{task.text}}</textarea>
    <div class="palette">
      <div class="color" ng-repeat="color in colors" ng-click="colorTask(task, color)">
        <div class="color1" style="background: {{color.color1}}; color: {{color.color3}}"></div>
        <div class="color2" style="background: {{color.color2}}"></div>
      </div>
    </div>
  </div>
</div>
