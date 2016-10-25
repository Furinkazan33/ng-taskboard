<div id="content" class="row">
  <div class="col s{{colSize}} " id="{{col._id}}" ng-repeat="col in cols">
    <p class="center-align">{{col.title}}</p>
    <ngtasktpl ng-repeat="task in tasks | filter:currentTab(col._id)"></ngtasktpl>
  </div>
</div>
