<template>
  <div class="title">
    <template v-if="false">
      <h1 class="accent">JWT Online Cracker</h1>
      <h3>
        Brute-force <b>HS256</b>, <b>HS384</b> or <b>HS512</b> JWT Token from your browser.<br />
        No installation needed.
      </h3>
    </template>
    <template v-else>
      <h1 class="warning">Invalid Token</h1>
    </template>
  </div>
</template>

<style scoped>
.title {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1rem;
  text-align: center;
}

h1 {
  font-weight: 500;
  font-size: 2.6rem;
}

h3 {
  font-size: 1.2rem;
}

b {
  color: var(--color-accent);
}

@media (min-width: 1024px) {
}
</style>
