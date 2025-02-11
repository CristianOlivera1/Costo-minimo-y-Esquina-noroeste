def solve_transport_problem(supply, demand, costs):
    rows, cols = len(supply), len(demand)
    allocation = [[0] * cols for _ in range(rows)]
    total_cost = 0

    # Algoritmo de costo mínimo
    while sum(supply) > 0 and sum(demand) > 0:
        min_cost = float('inf')
        min_cell = None

        # Buscar el costo mínimo
        for i in range(rows):
            for j in range(cols):
                if supply[i] > 0 and demand[j] > 0 and costs[i][j] < min_cost:
                    min_cost = costs[i][j]
                    min_cell = (i, j)

        i, j = min_cell
        allocation_amount = min(supply[i], demand[j])
        allocation[i][j] = allocation_amount
        total_cost += allocation_amount * costs[i][j]
        supply[i] -= allocation_amount
        demand[j] -= allocation_amount

    return allocation, total_cost
