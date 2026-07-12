<!--
  SidebarCurve — the only handwritten UI primitive.
  Implements the inward notch where sidebar meets header.
  Place as the FIRST child of the header element.
  Header must have `position: relative`.
  If sidebar bg changes, update .sidebar-curve::after in main.css to match.
-->
<script setup lang="ts"></script>

<template>
  <div class="sidebar-curve" aria-hidden="true" />
</template>
